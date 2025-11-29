# @theWallProject/common

Common types and utilities for theWall addon projects.

## Adding Support for a New Platform

⚠️ **IMPORTANT: When adding support for a new platform, you MUST update all of the following to prevent runtime errors:**

### Steps to Add a New Platform (e.g., Instagram, GitHub)

1. **Add domain to `SpecialDomains` type**

   ```typescript
   export type SpecialDomains =
     | "linkedin.com"
     | "facebook.com"
     // ... existing domains ...
     | "newplatform.com" // ← Add here
   ```

2. **Create the endpoint rule constant**

   ```typescript
   export const API_ENDPOINT_RULE_NEWPLATFORM = {
     domain: "newplatform.com",
     regex: "(?:newplatform.com)/([^/?]+)"
   } as const satisfies APIEndpointRule
   ```

3. **Add to `DBFileNames` enum**

   ```typescript
   export enum DBFileNames {
     // ... existing entries ...
     FLAGGED_NEWPLATFORM = "FLAGGED_NEWPLATFORM" // ← Add here
   }
   ```

4. **Add field to `FinalDBFileSchema`**

   ```typescript
   export const FinalDBFileSchema = z.object({
     // ... existing fields ...
     np: z.string().optional() // ← Add here (use short abbreviation)
   })
   ```

5. **⚠️ ADD TO CONFIG - Don't forget this!**
   ```typescript
   export const CONFIG: APIEndpointConfig = {
     rules: [
       // ... existing rules ...
       API_ENDPOINT_RULE_NEWPLATFORM // ← Add here
     ]
   }
   ```

### Checklist Template

- [ ] Domain added to `SpecialDomains` type
- [ ] `API_ENDPOINT_RULE_*` constant created
- [ ] Entry added to `DBFileNames` enum (`FLAGGED_*`)
- [ ] Field added to `FinalDBFileSchema` (short abbreviation)
- [ ] **Rule added to `CONFIG.rules` array** ⚠️

## Usage

This package is used by The Wall projects to:

- Define types and schemas for domain detection
- Provide endpoint rules for special domains (LinkedIn, Facebook, Twitter, Instagram, GitHub)
- Extract and validate domain information
