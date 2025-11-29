# Language Unification Plan

## Current State
- **JavaScript**: 44.5% (mostly .jsx React components)
- **PHP**: 30.4% (backend API endpoints)
- **TypeScript**: 11.7% (some API routes)
- **CSS**: 6.8% (styling - necessary)
- **HTML**: 4.7% (templates - necessary)
- **PLpgSQL**: 0.8% (database functions - necessary)

## Target State
- **TypeScript**: ~85% (all frontend code + API routes)
- **PHP**: ~10% (legacy endpoints, gradually migrate)
- **CSS**: ~5% (styling - keep as is)
- **PLpgSQL**: <1% (database - keep as is)

## Migration Strategy

### Phase 1: Convert JavaScript Utilities to TypeScript (Quick Wins)
1. ✅ `api.js` → `api.ts`
2. ✅ `config.js` → `config.ts`
3. ✅ `lib/utils.js` → `lib/utils.ts`
4. ✅ `supabaseClient.js` → `supabaseClient.ts`
5. ✅ `supabaseAuth.js` → `supabaseAuth.ts`
6. ✅ `supabaseData.js` → `supabaseData.ts`
7. ✅ `utils/supabaseStorage.js` → `utils/supabaseStorage.ts`
8. ✅ `utils/migrateImagesToSupabase.js` → `utils/migrateImagesToSupabase.ts`
9. ✅ `data/providers.js` → `data/providers.ts`
10. ✅ `data/addons.js` → `data/addons.ts`

### Phase 2: Convert React Components (.jsx → .tsx)
Priority order:
1. Core components (Layout, Navbar, Footer)
2. Page components (Home, Login, Register)
3. Feature components (Checkout, Payment, Orders)
4. Dashboard components
5. Utility components

### Phase 3: Migrate PHP Backend to TypeScript (Gradual)
- Keep PHP endpoints working
- Create Next.js API routes in parallel
- Gradually deprecate PHP endpoints
- Final: Remove PHP backend

## Benefits
- ✅ Type safety across the codebase
- ✅ Better IDE support and autocomplete
- ✅ Easier refactoring
- ✅ Fewer runtime errors
- ✅ Unified codebase (easier maintenance)

