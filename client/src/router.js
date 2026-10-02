import { createRouter, createWebHistory, createWebHashHistory } from "vue-router";

const routes = [
  { path: "/", component: () => import("./pages/HomePage.vue") },
  { path: "/products", component: () => import("./pages/ProductsPage.vue") },
  { path: "/range/:slug", component: () => import("./pages/RangePage.vue") },
  { path: "/brands", component: () => import("./pages/BrandsPage.vue") },
  { path: "/brand/:slug", component: () => import("./pages/BrandPage.vue") },
  { path: "/product/:slug", component: () => import("./pages/ProductPage.vue") },
  { path: "/solutions", component: () => import("./pages/SolutionsPage.vue") },
  { path: "/solutions/:slug", component: () => import("./pages/SolutionPage.vue") },
  { path: "/about", component: () => import("./pages/AboutPage.vue") },
  { path: "/contact", component: () => import("./pages/ContactPage.vue") },
  { path: "/admin", component: () => import("./pages/admin/AdminPage.vue"), meta: { admin: true } },
  { path: "/:pathMatch(.*)*", component: () => import("./pages/NotFound.vue") }
];

export default createRouter({
  history: import.meta.env.VITE_PREVIEW ? createWebHashHistory() : createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved;
    if (to.path === from.path) return false;   // only filters changed: stay put
    return { top: 0 };
  }
});
