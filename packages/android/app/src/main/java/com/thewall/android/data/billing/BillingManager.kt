package com.thewall.android.data.billing

import android.app.Activity
import android.content.Context
import com.android.billingclient.api.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Manages Google Play Billing for the $1/month supporter subscription.
 */
class BillingManager(context: Context) : PurchasesUpdatedListener {

    companion object {
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

    private var productDetails: ProductDetails? = null

    fun startConnection() {
        _connectionState.value = BillingConnectionState.CONNECTING
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    _connectionState.value = BillingConnectionState.CONNECTED
                    queryProductDetails()
                    queryPurchases()
                } else {
                    _connectionState.value = BillingConnectionState.ERROR
                }
            }

            override fun onBillingServiceDisconnected() {
                _connectionState.value = BillingConnectionState.DISCONNECTED
            }
        })
    }

    private fun queryProductDetails() {
        val productList = listOf(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(PRODUCT_ID_SUPPORTER)
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        )

        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(productList)
            .build()

        billingClient.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                productDetails = productDetailsList.firstOrNull()
            }
        }
    }

    private fun queryPurchases() {
        billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        ) { billingResult, purchasesList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                val hasActiveSubscription = purchasesList.any { purchase ->
                    purchase.products.contains(PRODUCT_ID_SUPPORTER) &&
                            purchase.purchaseState == Purchase.PurchaseState.PURCHASED
                }
                _isSubscribed.value = hasActiveSubscription

                // Acknowledge any unacknowledged purchases
                purchasesList.forEach { purchase ->
                    if (!purchase.isAcknowledged && purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                        acknowledgePurchase(purchase)
                    }
                }
            }
        }
    }

    private fun acknowledgePurchase(purchase: Purchase) {
        val params = AcknowledgePurchaseParams.newBuilder()
            .setPurchaseToken(purchase.purchaseToken)
            .build()

        billingClient.acknowledgePurchase(params) { /* Acknowledged */ }
    }

    fun launchSubscriptionFlow(activity: Activity): Boolean {
        val details = productDetails ?: return false
        val offerToken = details.subscriptionOfferDetails?.firstOrNull()?.offerToken ?: return false

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
        return result.responseCode == BillingClient.BillingResponseCode.OK
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: List<Purchase>?) {
        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            purchases.forEach { purchase ->
                if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                    _isSubscribed.value = true
                    if (!purchase.isAcknowledged) {
                        acknowledgePurchase(purchase)
                    }
                }
            }
        }
    }

    fun endConnection() {
        billingClient.endConnection()
    }
}

enum class BillingConnectionState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    ERROR
}
