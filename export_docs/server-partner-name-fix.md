**Project:** dcarbon-server
**Branch:** `phillip-fix3`
**Priority:** HIGH — partner business names are not showing anywhere in admin

## Problem

`GET /api/admin/get-all-users` returns `companyName` from the `commercialUser` relation, but **partners don't have a `commercialUser` record**. Partners store their business name in the `Partner` model's `name` field.

Result: `companyName` is always `null` for PARTNER users across the entire admin dashboard.

## Fix

In `src/services/admin.service.ts`, the `getAllUsers` function (around line 60-140):

### 1. Add `partner` to the Prisma select (around line 92):

```typescript
// After commercialUser select, add:
partner: {
  select: {
    name: true,
    address: true,
    phoneNumber: true,
  },
},
```

### 2. Update the formatter (around line 112-124) to use partner data:

```typescript
const companyName = user.commercialUser?.companyName ?? user.partner?.name ?? null;
const ownerFullName = user.commercialUser?.ownerFullName ?? null;
const partnerAddress = user.partner?.address ?? null;
const partnerPhone = user.partner?.phoneNumber ?? null;

// In the return object, also add:
return {
  // ... existing fields ...
  companyName,
  ownerFullName,
  address: user.commercialUser?.companyAddress ?? partnerAddress ?? null,
  phoneNumber: user.commercialUser?.phoneNumber ?? partnerPhone ?? user.phoneNumber ?? null,
  // ...
};
```

### 3. Also fix `findUserByEmail` in `src/services/user.service.ts` (line ~357):

Currently does a plain `findUnique` with no includes. Add:

```typescript
static async findUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      partner: {
        select: { name: true, address: true, phoneNumber: true },
      },
      commercialUser: {
        select: { companyName: true, ownerFullName: true, companyAddress: true, phoneNumber: true },
      },
    },
  });
  return user;
}
```

This way, both the list view AND individual detail fetches return company/partner business data.

Build and push to `phillip-fix3`.
