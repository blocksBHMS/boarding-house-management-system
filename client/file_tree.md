bhns_web/client/bhns/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Icon.vue                  # Reusable UI icons
│   │   │   ├── Modal.vue                 # Shared modal component
│   │   │   ├── StatusTag.vue             # Reusable status badges (paid, partial, unpaid)
│   │   │   └── ToastHost.vue             # Toast notification container
│   │   ├── AccountList.vue               # Account/Tenant management list
│   │   ├── BedList.vue                   # Bed management list
│   │   ├── Editor.vue                    # The 3D Neo-Brutalist Boarding House Editor
│   │   ├── HouseScene.vue                # The Top-down 3D scene (used in Overview)
│   │   ├── InvoiceItemList.vue           # The Charges/Invoice Items management table
│   │   ├── InvoiceList.vue               # Invoices management table
│   │   ├── Login.vue                     # Auth login page
│   │   ├── Overview.vue                  # Main dashboard with KPIs and top-down 3D view
│   │   ├── PaymentList.vue               # Payments management table
│   │   ├── RoomList.vue                  # Room management list
│   │   └── TenancyList.vue               # Tenancies management table
│   ├── composables/
│   │   ├── toast.ts                      # Composition API for toast notifications
│   │   └── useHouse.ts                   # Composition API alternative to store
│   ├── router/
│   │   └── index.router.ts               # Vue Router configuration
│   ├── services/
│   │   ├── api.ts                        # Axios instance and API service calls (DRF backend)
│   │   └── session.ts                    # Auth token and session management
│   ├── store/
│   │   ├── house.ts                      # Reactive central store (house, rooms, beds, invoices)
│   │   └── layout.ts                     # UI layout state (sidebar, etc.)
│   ├── types/
│   │   └── index.ts                      # TypeScript interfaces (Account, Bed, Room, Invoice)
│   ├── utils/
│   │   └── index.ts                      # Helper functions (date formatting, etc.)
│   ├── App.vue                           # Root Vue component
│   ├── main.css                          # Tailwind CSS directives
│   └── main.ts                           # Vue application mount point
├── index.html                            # Main HTML entry
├── package.json                          # Node dependencies
├── tsconfig.json                         # TypeScript configuration
├── tsconfig.node.json
└── vite.config.ts                        # Vite bundler configuration