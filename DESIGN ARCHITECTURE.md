# ByteHive CRM Frontend - Design & Architecture Reference

This document defines the core design system, visual philosophy, component blueprints, and styling guidelines that govern the **ByteHive "Industrial Instrument"** aesthetic. It serves as a master reference guide for developers to ensure perfect styling and user experience consistency across all modules of the platform.

---

## 🎨 Design Philosophy: "Industrial Instrument"

ByteHive is designed to feel like a high-end, high-performance precision technical instrument rather than a generic web application. The aesthetic balances a minimalist dark mode with atmospheric depth, mechanical definition, and high data density.

### 🌌 Atmospheric Depth
*   **The Pitched Void**: The primary background is always a true **Black (#000000)**, but it is never flat.
*   **Structural Grid**: A fixed `radial-gradient` point grid (32px intervals) provides a subtle sense of scale and technical precision.
*   **Ambient Glows**: Soft, moving radial "blobs" in the background (using `blur-[120px]` and localized top-corner glows) provide depth and prevent visual fatigue.

### 💡 Lighting Architecture: "Top-Down Illumination"
*   **Instrument Header**: Headers use a semi-transparent `bg-black/50` with high-intensity `backdrop-blur-xl` and a sharp bottom divider (`border-b border-zinc-800`).
*   **Radial Lighting**: All primary page headers are illuminated from the top-center using a radial gradient that fades into the data repository area.
*   **Micro-Glows**: Interactive elements (stats, buttons, rows, active inputs) feature subtle blue or neutral glows on hover/focus to simulate a digital "powered-on" state.

### ⚙️ Materiality & Borders
*   **Mechanical Gray**: Primary data containers (Kanban stages, Repositories, Modals) use a solid **`bg-zinc-900/30`** background.
*   **Sharp Definition**: Borders are never "soft" or blurry. Use **`border-zinc-800`** for primary container definition and `border-white/5` for ultra-subtle internal dividers.
*   **Refined Glass**: Glassmorphism is used sparingly for overlays, typically with `bg-white/[0.02]` and `border-white/10`.

---

## 🎭 Color & Accent Tokens

### Technical Base
```css
--background: #000000       /* Deep Field */
--instrument: #18181b       /* zinc-900 - Technical container base */
--material: #27272a         /* zinc-800 - Borders and dividers */
--accent: #3b82f6           /* blue-500 - Operational primary color */
```

### Contrast Highlights & Accents
To maintain a high-end utilitarian look, accents are applied via low-saturation, semi-transparent fills combined with matching borders and colored text. Avoid full-bleed solid color fills unless explicitly required.

| Accent Category | CSS Classes | Usage Example |
| :--- | :--- | :--- |
| **System/Primary (Blue)** | `bg-blue-500/10 text-blue-400 border-blue-500/20` | Active pipelines, primary tools, standard dialog states |
| **Custom/Settings (Amber)** | `bg-amber-500/10 text-amber-400 border-amber-500/20` | Toggled active status, custom fields enabled, warnings |
| **Success/Value (Emerald)** | `bg-emerald-500/10 text-emerald-400 border-emerald-500/20` | Deal values, win statuses, positive metrics |
| **Critical/Alert (Red)** | `bg-red-500/10 text-red-500 border-red-500/20` | Validation errors, delete confirmations, lost states |

---

## 📐 Layout Architecture

### Standard Spacing Scale
*   **Page Padding**: `px-10 py-8` (Strictly uniform across all dashboards).
*   **Section Gap**: `space-y-10` or `gap-8`.
*   **Card Grid Gap**: `gap-6` (Grid cards, actions, columns).
*   **Card Internal Padding**: `p-6` (Dense, legible padding).
*   **Button Groups**: `gap-3` or `gap-4`.

### The Unified Header (Standard Pattern)
Used at the top of both the CRM and Contacts modules to establish perfect layout symmetry:
```jsx
<header className="px-10 py-8 flex justify-between items-center border-b border-white/5 relative z-20 bg-black/50 backdrop-blur-xl shrink-0">
  <div className="space-y-0.5">
    <h1 className="text-2xl font-semibold text-white">Page Title</h1>
    <p className="text-sm text-white/40">Page description / sub-text</p>
  </div>
  
  <div className="flex items-center gap-2">
    {/* Buttons, Actions, Tools, or Ingestion triggers */}
  </div>
</header>
```

---

## 🧩 Component Blueprints

### 1. High-Density Structured Modals (Settings-Driven Forms)
Used for forms whose fields are configured dynamically (e.g., `AddLeadStructured.jsx`).
*   **Width**: Snug, centered **`max-w-lg`** (512px) for maximum readability and high layout density.
*   **Grid Structure**: Responsive 2-in-a-row CSS Grid:
    ```jsx
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {/* Symmetrical fields are rendered as col-span-2 sm:col-span-1 */}
    </div>
    ```
*   **Minimalist Labels**: Clean, lightweight labels without bold weights or wide letter trackings to maintain terminal-like elegance:
    ```jsx
    <label className="text-[10px] text-white/40 uppercase flex items-center gap-1">
      Name <span className="text-red-500">*</span>
    </label>
    ```
*   **Micro-Size Badges**: For dense, high-end visual indicators under headers:
    ```jsx
    <span className="text-[9px] px-2 py-0.5 rounded border uppercase bg-amber-500/10 text-amber-400 border-amber-500/20">
      Custom Fields Enabled
    </span>
    ```

### 2. The Split-Screen Registry Modal (Details/Comprehensive Forms)
Used for deep data exploration or massive detail entry (e.g., `AddLeadDialog.jsx`, `ContactDetailModal.jsx`).
*   **Width**: Symmetrical **`max-w-3xl`** (768px).
*   **Layout**: Symmetrical double columns separated by a crisp 1px vertical divider:
    ```jsx
    <div className="flex relative min-h-0 flex-1">
      {/* Left Column: Primary Details */}
      <div className="flex-1 overflow-y-auto pr-3">...</div>
      
      {/* Divider */}
      <div className="w-[1px] bg-white/5 mx-6 shrink-0" />
      
      {/* Right Column: Registry Ledger / Custom fields */}
      <div className="flex-1 overflow-y-auto pr-3">...</div>
    </div>
    ```

### 3. Sliding Navigation Tabs (Pill-Based Switcher)
Primary mode switcher for dashboard views. Must be used for all tab navigation to ensure consistency.
*   **Structure**: A fixed-width container with `relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md`.
*   **Highlighter**: A sliding `absolute inset-y-0 bg-blue-500/20` div with `transition-all duration-300` that glides between active states.
*   **Geometry**: Internal edges of the highlighter are **sharp** (e.g., `rounded-l rounded-r-none` when left-aligned, `rounded-r rounded-l-none` when right-aligned) to simulate a connected mechanical assembly.
*   **Hierarchy**: 
  *   *Inactive*: `text-white/50 hover:text-white/80`
  *   *Active*: `text-blue-400`
*   **Typography**: All tabs must use `text-[10px] font-medium uppercase tracking-[0.2em]`
*   **JSX Example (2 tabs - e.g., Contacts vs Imports)**:
```jsx
<div className="relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md">
  <div 
    className={cn(
      "absolute inset-y-0 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0",
      activeTab === TABS.CONTACTS 
        ? "left-0 w-1/2 rounded-l rounded-r-none bg-blue-500/20" 
        : "left-1/2 w-1/2 rounded-r rounded-l-none bg-blue-500/20"
    )}
  />
  <button
    onClick={() => setActiveTab(TABS.CONTACTS)}
    className={cn(
      "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
      activeTab === TABS.CONTACTS ? "text-blue-400" : "text-white/50 hover:text-white/80"
    )}
  >
    Contacts
  </button>
  <button
    onClick={() => setActiveTab(TABS.IMPORTS)}
    className={cn(
      "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
      activeTab === TABS.IMPORTS ? "text-blue-400" : "text-white/50 hover:text-white/80"
    )}
  >
    Imports
  </button>
</div>
```

*   **JSX Example (3 tabs - e.g., Users vs Groups vs Audit Logs)**:
```jsx
<div className="relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md">
  <div 
    className={cn(
      "absolute inset-y-0 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0",
      activeTab === 'users' 
        ? "left-0 w-1/3 rounded-l rounded-r-none bg-blue-500/20" 
        : activeTab === 'groups'
        ? "left-1/3 w-1/3 bg-blue-500/20"
        : "left-2/3 w-1/3 rounded-r rounded-l-none bg-blue-500/20"
    )}
  />
  <button
    onClick={() => setActiveTab('users')}
    className={cn(
      "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
      activeTab === 'users' ? "text-blue-400" : "text-white/50 hover:text-white/80"
    )}
  >
    Users
  </button>
  <button
    onClick={() => setActiveTab('groups')}
    className={cn(
      "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
      activeTab === 'groups' ? "text-blue-400" : "text-white/50 hover:text-white/80"
    )}
  >
    Groups
  </button>
  <button
    onClick={() => setActiveTab('audit')}
    className={cn(
      "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
      activeTab === 'audit' ? "text-blue-400" : "text-white/50 hover:text-white/80"
    )}
  >
    Audit Logs
  </button>
</div>
```

### 4. High-Capacity Tool Buttons & Search Dialogs
*   **Tool Triggers**: Micro buttons for operational utilities should use uniform dimensions:
    `h-9 w-9 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group`
*   **Secondary Tool Actions**: `bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 text-white/60` to keep secondary operations subtle.

### 5. Reusable Component Button Variants (`Button.jsx`)
Used for master page actions, headers, and standard layout triggers:
*   **Primary Variant (Stark Contrast)**: Solid white with black text.
    `bg-white text-black hover:bg-gray-100 active:scale-[0.98]`
*   **Secondary Variant (Translucent Glass)**: Transparent white with light border.
    `bg-white/5 text-white border border-white/10 hover:bg-white/10 active:scale-[0.98]`

### 6. Unified Form Dialog Buttons (Industrial Scale)
All modal footers and dialog sheets must utilize our signature HSL semi-transparent color states:
*   **Primary / Save Button**: Uses the technical Blue Accent for active confirmation states.
    `px-6 py-2 rounded-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all`
*   **Destructive / Delete Button**: Uses the high-intensity Red Accent for permanent removals.
    `px-4 py-2 rounded-lg text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors`
*   **Secondary / Cancel Button**: Uses the muted Zinc-Gray Accent.
    `px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em]`

---

## 📋 Operational Design Checklist

Every new feature and screen built inside ByteHive must satisfy this design audit:
- [ ] Does it use **True Black (#000000)** as the base canvas?
- [ ] Are primary components utilizing the **`bg-zinc-900/30`** and **`border-zinc-800`** mechanical container combo?
- [ ] Are secondary internal dividers utilizing **`border-white/5`**?
- [ ] Do page headers align to the **Unified Header** spacing scheme (`px-10 py-8` with matching heights)?
- [ ] Are navigation state shifts built around the **Sliding Navigation Tabs** highlighter architecture?
- [ ] Do settings-driven structured forms use the **`max-w-lg`** snug 2-in-a-row grid layout?
- [ ] Do details/comprehensive forms use the **`max-w-3xl`** split-screen registry layout?
- [ ] Are input labels clean and elegant (`text-[10px] text-white/40 uppercase` without bold weight or letters tracking)?
- [ ] Are validation badges styled with the unified transparent accent scale (`bg-color/10 border-color/20 text-color`)?
- [ ] Are all portal triggers bound to `document.body` using **`createPortal`**?
- [ ] Is Tailwind class merging handled correctly using the **`cn()`** utility?
