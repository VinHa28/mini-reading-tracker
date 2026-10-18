import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "search",
      component: () => import("@/views/SearchView.vue"),
    },
    {
      path: "/books/:workId",
      name: "book-detail",
      component: () => import("@/views/BookDetailView.vue"),
      props: true,
    },
    {
      path: "/shelf",
      name: "shelf",
      component: () => import("@/views/ShelfView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
    },
  ],
});

export default router;
