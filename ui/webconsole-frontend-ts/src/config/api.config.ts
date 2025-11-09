export const API_CONFIG = {
    BASE_URL: 'https://api.example.com', // Replace with your actual API base URL
    ENDPOINTS: {
        DEVICE_GROUPS: {
            CREATE: '/device-groups',
            READ: '/device-groups/:id',
            UPDATE: '/device-groups/:id',
            DELETE: '/device-groups/:id',
            LIST: '/device-groups',
        },
        GNB_INVENTORY: {
            CREATE: '/gnb-inventory',
            READ: '/gnb-inventory/:id',
            UPDATE: '/gnb-inventory/:id',
            DELETE: '/gnb-inventory/:id',
            LIST: '/gnb-inventory',
        },
        NETWORK_SLICES: {
            CREATE: '/network-slices',
            READ: '/network-slices/:id',
            UPDATE: '/network-slices/:id',
            DELETE: '/network-slices/:id',
            LIST: '/network-slices',
        },
        SUBSCRIBERS: {
            CREATE: '/subscribers',
            READ: '/subscribers/:id',
            UPDATE: '/subscribers/:id',
            DELETE: '/subscribers/:id',
            LIST: '/subscribers',
        },
        UPF_INVENTORY: {
            CREATE: '/upf-inventory',
            READ: '/upf-inventory/:id',
            UPDATE: '/upf-inventory/:id',
            DELETE: '/upf-inventory/:id',
            LIST: '/upf-inventory',
        },
    },
};