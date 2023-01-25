import { defineStore } from "pinia";
import { nextTick, shallowRef, toRaw } from "vue";

export const useCoreStore = defineStore("core", {
  state: () => ({
    manufacturers: shallowRef(null),
    types: shallowRef(null),
    filaments: shallowRef([]),
    genericFilaments: shallowRef({}),
    families: shallowRef([]),
    models: shallowRef({}),
    frameColors: shallowRef({}),
    mods: shallowRef([]),
    printerSearchParams: {},
    printerResults: [],
    printerResultCount: null,
    userData: null,
    scrollIndex: 0,
    resultsLoaded: false,
    loading: false,
    loaded: false,
    logoOverride: false,
    logo1: null,
    logo2: null,
    logo3: null,
    shownFilters: [],
    allFilters: [
      {
        label: "Printer Model",
        fields: ["frmFamily", "frmModel"],
        qs: ["printer_model", "printer_model__family"],
      },
      {
        label: "Frame Color",
        fields: ["frmFrameColor"],
        qs: ["frame_color"],
      },
      {
        label: "Primary Filament",
        fields: ["frmPrimaryFilament"],
        qs: ["primary_filament", "primary_filament__color_category"],
      },
      {
        label: "Accent Filament",
        fields: ["frmAccentFilament"],
        qs: ["accent_filament", "accent_filament__color_category"],
      },
      {
        label: "Installed Mods",
        fields: ["frmMods"],
        qs: ["mods"],
      },
    ],
    _initialized: false,
    userPrinters: null,
  }),

  getters: {},

  actions: {
    updatePrinter(printer) {
      if (this.printerResults.length) {
        const result = this.printerResults.filter(
          (p) => p.id === printer.id
        )[0];
        if (result) {
          Object.assign(result, printer);
        }
      }
    },
    async fetchPrinter(id) {
      return (await this.$api.get(`/api/printer/${id}/`)).data;
    },

    newSearch() {
      this.printerResults.splice(0, this.printerResults.length);
      this.printerResultCount = null;
      this.scrollIndex = 0;
    },

    getGenericFilament(color_category_id) {},

    async fetchUserPrinters(username) {
      try {
        const resp = await this.$api.get(`/api/printer/user/${username}/`);
        this.userPrinters = resp.data;
        return this.userPrinters;
      } catch (err) {
        return null;
      }
    },
    async fetchUser() {
      this.userData = await (await this.$api.get("/api/me/")).data;
    },

    async fetchResults(page) {
      page = page || 0;
      this.scrollIndex = page;
      const params = new URLSearchParams();
      for (let [k, v] of Object.entries(this.printerSearchParams)) {
        if (k === "mods") {
          for (let m of v) {
            params.append(k, m);
          }
        } else {
          params.append(k, v);
        }
      }
      params.set("page", page);
      const opts = {
        params: params,
      };
      const response = await this.$api.get("/api/printer/", opts);
      response.data.results.forEach((r) => this.printerResults.push(r));
      this.printerResultCount = response.data.count;
    },

    async fetchData() {
      if (!this.loading && !this.loaded) {
        if (this.userData === null) {
          this.fetchUser();
        }
        this.loading = true;
        const data = await this.$api.get("/api/bootstrap/");

        this.frameColors = Object.freeze(
          new Map(data.data.frame_colors.map((fc) => [fc.id, fc]))
        );

        this.models = Object.freeze(
          new Map(data.data.models.map((m) => [m.id, m]))
        );

        this.types = Object.freeze(
          new Map(data.data.types.map((t) => [t.id, t]))
        );
        this.manufacturers = Object.freeze(
          new Map(data.data.manufacturers.map((m) => [m.id, m]))
        );
        this.families = Object.freeze(
          new Map(data.data.families.map((f) => [f.id, f]))
        );

        this.filaments = Object.freeze(
          new Map(data.data.filaments.map((f) => [f.id, Object.freeze(f)]))
        );
        this.genericFilaments = Object.freeze(
          new Map(
            Array.from(this.filaments.values())
              .filter((f) => f.manufacturer_id === 1)
              .map((f) => [f.color_category_id, f])
          )
        );
        this.mods = Object.freeze(
          new Map(data.data.mods.map((m) => [m.id, Object.freeze(m)]))
        );
        this.loaded = true;
        this.loading = false;
      }
    },
  },
});
