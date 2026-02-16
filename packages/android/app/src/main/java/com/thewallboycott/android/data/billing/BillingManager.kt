package com.thewallboycott.android.data.billing

import android.app.Activity
import android.content.Context
import android.util.Log
import com.android.billingclient.api.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Manages Google Play Billing for the $1/month supporter subscription.
 *
 * Designed to fail hard and visibly at every stage so billing issues are
 * immediately surfaced to both developers (via Logcat) and users (via
 * [diagnosticMessage] shown in the UI). Every failure path records a
 * human-readable diagnostic that the SupportScreen renders as a visible
 * error banner.
 *
 * Failure chain tracked by [BillingStage]:
 * IDLE -> CONNECTING -> CONNECTED -> PRODUCT_QUERY -> PRODUCT_READY -> (launch flow)
 *
 * If any stage fails, [connectionState] is set to ERROR, [diagnosticMessage]
 * explains what went wrong, and the donate button shows the error to the user.
 */
class BillingManager(context: Context) : PurchasesUpdatedListener {

    companion object {
        private const val TAG = "BillingManager"
        const val PRODUCT_ID_SUPPORTER = "supporter_monthly"
    }

    private val billingClient = BillingClient.newBuilder(context)
        .setListener(this)
        .enablePendingPurchases(
            PendingPurchasesParams.newBuilder()
                .enableOneTimeProducts()
                .enablePrepaidPlans()
                .build()
        )
        .build()

    private val _isSubscribed = MutableStateFlow(false)
    val isSubscribed: StateFlow<Boolean> = _isSubscribed.asStateFlow()

    private val _connectionState = MutableStateFlow(BillingConnectionState.DISCONNECTED)
    val connectionState: StateFlow<BillingConnectionState> = _connectionState.asStateFlow()

    /** Current stage in the billing setup pipeline. */
    private val _billingStage = MutableStateFlow(BillingStage.IDLE)
    val billingStage: StateFlow<BillingStage> = _billingStage.asStateFlow()

    /**
     * Human-readable diagnostic message describing the current billing state
     * or the last error that occurred. Shown to the user in a visible banner
     * so billing configuration issues are immediately obvious.
     */
    private val _diagnosticMessage = MutableStateFlow<String?>(null)
    val diagnosticMessage: StateFlow<String?> = _diagnosticMessage.asStateFlow()

    private var productDetails: ProductDetails? = null

    /**
     * Whether the billing pipeline has completed successfully and a purchase
     * flow can be launched. True only when product details AND offer tokens
     * are available.
     */
    val isReadyToPurchase: Boolean
        get() = _billingStage.value == BillingStage.PRODUCT_READY && productDetails != null

    private fun failWith(stage: BillingStage, message: String) {
        Log.e(TAG, "[$stage] $message")
        _billingStage.value = stage
        _connectionState.value = BillingConnectionState.ERROR
        _diagnosticMessage.value = "[$stage] $message"
    }

    fun startConnection() {
        _billingStage.value = BillingStage.CONNECTING
        _connectionState.value = BillingConnectionState.CONNECTING
        _diagnosticMessage.value = null
        Log.d(TAG, "Starting billing connection...")

        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                val code = billingResult.responseCode
                val debugMsg = billingResult.debugMessage

                if (code == BillingClient.BillingResponseCode.OK) {
                    Log.d(TAG, "Billing connection established")
                    _billingStage.value = BillingStage.CONNECTED
                    _connectionState.value = BillingConnectionState.CONNECTED
                    queryProductDetails()
                    queryPurchases()
                } else {
                    failWith(
                        BillingStage.CONNECTING,
                        "Connection failed: ${responseCodeToName(code)}. $debugMsg"
                    )
                }
            }

            override fun onBillingServiceDisconnected() {
                Log.w(TAG, "Billing service disconnected")
                _connectionState.value = BillingConnectionState.DISCONNECTED
                _billingStage.value = BillingStage.IDLE
                _diagnosticMessage.value = "Billing service disconnected. Reopen this page to retry."
            }
        })
    }

    private fun queryProductDetails() {
        _billingStage.value = BillingStage.PRODUCT_QUERY
        Log.d(TAG, "Querying product details for '$PRODUCT_ID_SUPPORTER'...")

        val productList = listOf(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(PRODUCT_ID_SUPPORTER)
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        )

        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(productList)
            .build()

        billingClient.queryProductDetailsAsync(params) { billingResult, result ->
            val code = billingResult.responseCode
            val debugMsg = billingResult.debugMessage

            if (code != BillingClient.BillingResponseCode.OK) {
                failWith(
                    BillingStage.PRODUCT_QUERY,
                    "Product query failed: ${responseCodeToName(code)}. $debugMsg"
                )
                return@queryProductDetailsAsync
            }

            val detailsList = result.productDetailsList
            if (detailsList.isEmpty()) {
                failWith(
                    BillingStage.PRODUCT_QUERY,
                    "Product '$PRODUCT_ID_SUPPORTER' not found. " +
                            "Check Play Console: the subscription must exist, " +
                            "have an active base plan, and the app must be " +
                            "installed from the Play Store (not sideloaded)."
                )
                return@queryProductDetailsAsync
            }

            val details = detailsList.first()
            val offers = details.subscriptionOfferDetails
            if (offers.isNullOrEmpty()) {
                failWith(
                    BillingStage.PRODUCT_QUERY,
                    "Product '$PRODUCT_ID_SUPPORTER' found but has no offers/base plans. " +
                            "In Play Console, ensure the subscription has at least one " +
                            "ACTIVE base plan with pricing configured."
                )
                return@queryProductDetailsAsync
            }

            productDetails = details
            _billingStage.value = BillingStage.PRODUCT_READY
            _diagnosticMessage.value = null
            Log.d(
                TAG,
                "Product ready: ${details.name}, " +
                        "${offers.size} offer(s), " +
                        "first offer token: ${offers.first().offerToken.take(20)}..."
            )
        }
    }

    private fun queryPurchases() {
        Log.d(TAG, "Querying existing purchases...")

        billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        ) { billingResult, purchasesList ->
            val code = billingResult.responseCode
            if (code != BillingClient.BillingResponseCode.OK) {
                Log.e(
                    TAG,
                    "Purchase query failed: ${responseCodeToName(code)}. " +
                            billingResult.debugMessage
                )
                return@queryPurchasesAsync
            }

            val hasActiveSubscription = purchasesList.any { purchase ->
                purchase.products.contains(PRODUCT_ID_SUPPORTER) &&
                        purchase.purchaseState == Purchase.PurchaseState.PURCHASED
            }
            _isSubscribed.value = hasActiveSubscription
            Log.d(TAG, "Existing purchases: ${purchasesList.size}, subscribed: $hasActiveSubscription")

            // Acknowledge any unacknowledged purchases
            purchasesList.forEach { purchase ->
                if (!purchase.isAcknowledged && purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                    acknowledgePurchase(purchase)
                }
            }
        }
    }

    private fun acknowledgePurchase(purchase: Purchase) {
        Log.d(TAG, "Acknowledging purchase: ${purchase.orderId}")

        val params = AcknowledgePurchaseParams.newBuilder()
            .setPurchaseToken(purchase.purchaseToken)
            .build()

        billingClient.acknowledgePurchase(params) { billingResult ->
            val code = billingResult.responseCode
            if (code == BillingClient.BillingResponseCode.OK) {
                Log.d(TAG, "Purchase acknowledged: ${purchase.orderId}")
            } else {
                Log.e(
                    TAG,
                    "Failed to acknowledge purchase ${purchase.orderId}: " +
                            "${responseCodeToName(code)}. ${billingResult.debugMessage}"
                )
            }
        }
    }

    /**
     * Launch the Google Play subscription purchase flow.
     *
     * @return A human-readable error message if the flow could not be launched,
     *         or null on success. The caller MUST show the error to the user.
     */
    fun launchSubscriptionFlow(activity: Activity): String? {
        val details = productDetails
        if (details == null) {
            val msg = "Cannot launch purchase: product details not loaded. " +
                    "Stage: ${_billingStage.value}"
            Log.e(TAG, msg)
            return msg
        }

        val offers = details.subscriptionOfferDetails
        if (offers.isNullOrEmpty()) {
            val msg = "Cannot launch purchase: no offers/base plans available for " +
                    "'$PRODUCT_ID_SUPPORTER'"
            Log.e(TAG, msg)
            return msg
        }

        val offerToken = offers.first().offerToken

        val productDetailsParamsList = listOf(
            BillingFlowParams.ProductDetailsParams.newBuilder()
                .setProductDetails(details)
                .setOfferToken(offerToken)
                .build()
        )

        val billingFlowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(productDetailsParamsList)
            .build()

        val result = billingClient.launchBillingFlow(activity, billingFlowParams)
        val code = result.responseCode

        if (code != BillingClient.BillingResponseCode.OK) {
            val msg = "Billing flow launch failed: ${responseCodeToName(code)}. " +
                    result.debugMessage
            Log.e(TAG, msg)
            return msg
        }

        Log.d(TAG, "Billing flow launched successfully")
        return null
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: List<Purchase>?) {
        val code = billingResult.responseCode
        Log.d(TAG, "onPurchasesUpdated: ${responseCodeToName(code)}, ${purchases?.size ?: 0} purchases")

        if (code == BillingClient.BillingResponseCode.OK && purchases != null) {
            purchases.forEach { purchase ->
                if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                    _isSubscribed.value = true
                    if (!purchase.isAcknowledged) {
                        acknowledgePurchase(purchase)
                    }
                }
            }
        } else if (code != BillingClient.BillingResponseCode.USER_CANCELED) {
            // User cancellation is normal, everything else is an error
            Log.e(
                TAG,
                "Purchase update failed: ${responseCodeToName(code)}. " +
                        billingResult.debugMessage
            )
            _diagnosticMessage.value = "Purchase failed: ${responseCodeToName(code)}. " +
                    billingResult.debugMessage
        }
    }

    fun endConnection() {
        Log.d(TAG, "Ending billing connection")
        billingClient.endConnection()
    }
}

/**
 * Maps BillingClient response codes to human-readable names for diagnostics.
 * Covers all codes from the Google Play Billing Library.
 */
private fun responseCodeToName(code: Int): String = when (code) {
    BillingClient.BillingResponseCode.OK -> "OK"
    BillingClient.BillingResponseCode.USER_CANCELED -> "USER_CANCELED"
    BillingClient.BillingResponseCode.SERVICE_UNAVAILABLE -> "SERVICE_UNAVAILABLE"
    BillingClient.BillingResponseCode.BILLING_UNAVAILABLE -> "BILLING_UNAVAILABLE (no Play Store?)"
    BillingClient.BillingResponseCode.ITEM_UNAVAILABLE -> "ITEM_UNAVAILABLE"
    BillingClient.BillingResponseCode.DEVELOPER_ERROR -> "DEVELOPER_ERROR (bad request)"
    BillingClient.BillingResponseCode.ERROR -> "ERROR (fatal)"
    BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED -> "ITEM_ALREADY_OWNED"
    BillingClient.BillingResponseCode.ITEM_NOT_OWNED -> "ITEM_NOT_OWNED"
    BillingClient.BillingResponseCode.NETWORK_ERROR -> "NETWORK_ERROR"
    BillingClient.BillingResponseCode.FEATURE_NOT_SUPPORTED -> "FEATURE_NOT_SUPPORTED"
    BillingClient.BillingResponseCode.SERVICE_DISCONNECTED -> "SERVICE_DISCONNECTED"
    else -> "UNKNOWN($code)"
}

/** Tracks progress through the billing setup pipeline. */
enum class BillingStage {
    /** No connection attempt made yet. */
    IDLE,
    /** Connecting to Google Play Billing service. */
    CONNECTING,
    /** Connected, but product details not yet queried. */
    CONNECTED,
    /** Querying product details from Play Store. */
    PRODUCT_QUERY,
    /** Product details loaded, offers verified, ready to purchase. */
    PRODUCT_READY
}

enum class BillingConnectionState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    ERROR
}
