import { useCoreStore } from "stores/core";

async function loggedInUser(coreStore) {
  if (coreStore.userData?.id) {
    return coreStore.userData;
  } else {
    await coreStore.fetchUser();
    if (coreStore.userData?.id) {
      return coreStore.userData;
    }
  }
  return null;
}

const routes = [
  {
    path: "/",
    async beforeEnter(to, from, next) {
      const coreStore = useCoreStore();
      await coreStore.fetchData();
      next();
    },
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "index",
        component: () => import("pages/IndexPage.vue"),
      },
      {
        name: "about",
        path: "/about",
        component: () => import("pages/AboutPage.vue"),
      },
      {
        name: "slide-show",
        path: "/slideshow",
        component: () => import("pages/SlideShow.vue"),
      },
      {
        name: "contact-us",
        path: "/contact",
        component: () => import("pages/ContactForm.vue"),
      },
      { path: "login", component: () => import("pages/LoginPage.vue") },
      { path: "filament", component: () => import("pages/FilamentIndex.vue") },
      {
        path: "filament/add",
        component: () => import("pages/AddFilamentPage.vue"),
      },
      {
        name: "new",
        path: "new",
        component: () => import("pages/NewPrinter.vue"),
        async beforeEnter(to, from) {
          const coreStore = useCoreStore();
          const user = await loggedInUser(coreStore);

          if (user) {
            if (Object.keys(to.query).length) {
              let printer = {};
              if (to.query.reddit) {
                Object.assign(
                  printer,
                  (
                    await coreStore.$api.get(
                      `/api/reddit-serial/${to.query.reddit}/`
                    )
                  ).data
                );
              }
              Object.assign(printer, to.query);
              delete printer.reddit;
              coreStore.newPrinterPreset = printer;
              return { name: "new", replace: true };
            }
          } else {
            return `/login?next=${encodeURIComponent(to.fullPath)}`;
          }
        },
      },
      {
        name: "printerConfigBackups",
        path: "/printer/:printerId/backups/",
        props: true,
        component: () => import("pages/ConfigBackups.vue"),
        async beforeEnter(to, from, next) {
          const coreStore = useCoreStore();
          const user = await loggedInUser(coreStore);
          if (!user) {
            return next("/login");
          } else {
            let p;
            try {
              p = await coreStore.fetchPrinter(parseInt(to.params.printerId));
              if (p.submitted_by && p.submitted_by.id !== user.id) {
                if (!user.is_staff) {
                  return next("/");
                }
              }

              to.params.printer = p;
              next();
            } catch (err) {
              next("/");
            }
          }
        },
      },
      {
        name: "printerDetail",
        path: "/printer/:printerId",
        props: true,
        component: () => import("pages/PrinterDetailPage.vue"),
      },
      {
        name: "printerUpdate",
        path: "update/:id",
        props: true,
        component: () => import("pages/UpdatePrinter.vue"),
        async beforeEnter(to, from, next) {
          const coreStore = useCoreStore();
          const user = await loggedInUser(coreStore);
          if (!user) {
            return next("/login");
          } else {
            const p = await coreStore.fetchPrinter(parseInt(to.params.id));
            if (p.submitted_by && p.submitted_by.id !== user.id) {
              if (!user.is_staff) {
                return next("/");
              }
            }
            to.params.initialData = p;
            next();
          }
        },
      },
      {
        path: "my-printers",
        component: () => import("pages/MyPrinters.vue"),
        async beforeEnter(to, from, next) {
          const coreStore = useCoreStore();
          const user = await loggedInUser(coreStore);
          if (!user) {
            next("/login");
          } else {
            next();
          }
        },
      },
      {
        path: "user/:username",
        component: () => import("pages/UserPrinters.vue"),
        async beforeEnter(to, from, next) {
          const coreStore = useCoreStore();
          const response = await coreStore.fetchUserPrinters(
            to.params.username
          );
          if (response === null) {
            next({ name: "not-found" });
          }
          next();
        },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    name: "not-found",
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
