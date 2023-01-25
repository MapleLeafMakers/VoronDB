<template>
  <q-page padding class="indexpage">
    <PageHeader
      title="Browse the Voron Printer Database"
      icon="voron"
      caption="Use the form below to filter the results."
    />

    <div class="row q-mb-md">
      <div class="col">
        <q-form @submit.prevent>
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-xs-12">
              <q-input
                filled
                v-model="frmSearch"
                :debounce="500"
                label="Search for printers"
                clearable
              />
            </div>
          </div>
          <div
            class="form-section-wrapper"
            v-for="filter of coreStore.shownFilters"
            :key="filter.label"
          >
            <q-btn
              color="negative"
              icon="close"
              class="q-mb-sm q-mr-sm"
              @click="removeFilter(filter)"
            />
            <template v-if="filter.label === 'Printer Model'">
              <div class="row q-col-gutter-sm q-mb-sm">
                <div class="col-xs-12 col-sm-6">
                  <q-select
                    clearable
                    filled
                    option-label="name"
                    option-value="id"
                    v-model="frmFamily"
                    :options="
                      Object.freeze(Array.from(coreStore.families.values()))
                    "
                    label="Printer Family"
                  />
                </div>
                <div class="col-xs-12 col-sm-6">
                  <q-select
                    clearable
                    filled
                    option-label="model_name"
                    option-value="id"
                    v-model="frmModel"
                    :options="filteredModels"
                    label="Printer Model"
                  >
                    <template v-slot:selected-item="{ opt }">
                      <q-icon :name="opt.icon" class="q-mr-sm"></q-icon
                      >{{ opt.model_name }}
                    </template>
                    <template v-slot:option="{ itemProps, opt }">
                      <q-item v-bind="itemProps">
                        <q-item-section avatar>
                          <q-icon :name="opt.icon" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ opt.model_name }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
              </div>
            </template>
            <template v-else-if="filter.label == 'Installed Mods'">
              <div class="row q-col-gutter-sm q-mb-sm">
                <ModSelect v-model="frmMods" :installedOnly="true" />
              </div>
            </template>
            <template v-else-if="filter.label == 'Frame Color'">
              <div class="row q-col-gutter-sm q-mb-sm">
                <div class="col-xs-12">
                  <FrameColorSelect v-model="frmFrameColor" />
                </div>
              </div>
            </template>
            <template v-else-if="filter.label == 'Primary Filament'">
              <div class="row q-col-gutter-sm q-mb-sm">
                <div class="col-xs-12">
                  <FilamentPicker
                    label="Primary Color"
                    v-model="frmPrimaryFilament"
                  />
                </div>
              </div>
            </template>
            <template v-else-if="filter.label == 'Accent Filament'">
              <div class="row q-col-gutter-sm q-mb-sm">
                <div class="col-xs-12">
                  <FilamentPicker
                    label="Accent Color"
                    v-model="frmAccentFilament"
                  />
                </div>
              </div>
            </template>
          </div>
        </q-form>
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <q-btn-dropdown color="dark" no-caps label="More options">
              <q-list>
                <q-item
                  v-for="filter of coreStore.allFilters"
                  clickable
                  v-close-popup
                  @click="showFilter(filter)"
                  :key="filter.label"
                  :disable="coreStore.shownFilters.indexOf(filter) !== -1"
                >
                  <q-item-section>
                    <q-item-label>{{ filter.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>
      </div>
    </div>
    <div class="row q-mb-sm">
      <div class="col-6 flex column justify-end">
        <div v-if="coreStore.printerResultCount !== null">
          Found {{ coreStore.printerResultCount }} Printers
        </div>
        <div v-else>Searching...</div>
      </div>
      <div class="col-6">
        <div class="text-right">
          <q-btn-dropdown
            :icon="
              frmOrdering.startsWith('-') ? 'arrow_downward' : 'arrow_upward'
            "
            dropdown-icon="sort"
            no-icon-animation
            class="q-mr-sm"
            color="grey-9"
            :label="
              frmOrdering.endsWith('submitted_at')
                ? 'Date submitted'
                : 'Last updated'
            "
          >
            <q-list>
              <q-item
                clickable
                v-close-popup
                @click="
                  frmOrdering =
                    frmOrdering == '-submitted_at'
                      ? 'submitted_at'
                      : '-submitted_at'
                "
              >
                <q-item-section>
                  <q-item-label>Date Submitted</q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-icon
                    v-if="frmOrdering.endsWith('submitted_at')"
                    :name="
                      frmOrdering[0] == '-' ? 'arrow_downward' : 'arrow_upward'
                    "
                  ></q-icon>
                </q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="
                  frmOrdering =
                    frmOrdering == '-updated_at' ? 'updated_at' : '-updated_at'
                "
              >
                <q-item-section>
                  <q-item-label>Last Updated</q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-icon
                    v-if="frmOrdering.endsWith('updated_at')"
                    :name="
                      frmOrdering[0] == '-' ? 'arrow_downward' : 'arrow_upward'
                    "
                  ></q-icon>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn-toggle
            color="dark"
            toggle-color="grey-9"
            v-model="displayMode"
            :options="[
              { value: 'dm-sm', slot: 'dm-sm' },
              { value: 'dm-lg', slot: 'dm-lg' },
            ]"
          >
            <template v-slot:dm-sm>
              <q-icon name="zoom_out">
                <q-tooltip>Small cards</q-tooltip>
              </q-icon>
            </template>
            <template v-slot:dm-lg>
              <q-icon name="zoom_in">
                <q-tooltip>Large cards</q-tooltip>
              </q-icon>
            </template>
          </q-btn-toggle>
        </div>
      </div>
    </div>

    <q-separator class="q-mb-md" />
    <q-infinite-scroll
      v-if="isMounted"
      :initial-index="coreStore.scrollIndex"
      ref="infScroll"
      :disable="coreStore.printerResults.length == coreStore.printerResultCount"
      @load="onScroll"
      class="row q-col-gutter-lg items-stretch"
    >
      <q-resize-observer @resize="onResize" :debounce="500" />
      <PrinterCard
        v-for="printer of coreStore.printerResults"
        :printer="printer"
        :key="printer.id"
        :display-mode="displayMode"
        @update-likes="updateLikes"
      />
    </q-infinite-scroll>
  </q-page>
</template>
<style scoped lang="scss">
.form-section-wrapper {
  display: flex;
}
.form-section-wrapper .row {
  flex-grow: 1;
}
</style>
<script>
import { defineComponent, toRaw } from "vue";
import PrinterCard from "components/PrinterCard.vue";
import FrameColorSelect from "components/FrameColorSelect.vue";
import ModSelect from "components/ModSelect.vue";
import PageHeader from "components/PageHeader.vue";
import FilamentPicker from "components/FilamentPicker.vue";
import { useCoreStore } from "stores/core.js";
import { mapStores } from "pinia";

export default defineComponent({
  name: "IndexPage",
  mounted() {
    this.isMounted = true;
    const params = toRaw(this.coreStore.printerSearchParams);
    const qs = {};
    for (let [k, v] of Object.entries(this.$route.query)) {
      if (k === "mods") {
        if (!Array.isArray(v)) {
          v = [v];
        }
        v = v.map((val) => parseInt(val));
      } else if (k === "search" || k === "ordering") {
        // do nothing
      } else {
        v = parseInt(v);
      }
      qs[k] = v;
    }
    if (JSON.stringify(qs) !== JSON.stringify(params)) {
      this.coreStore.printerSearchParams = qs;
    }
  },

  created() {
    this.displayMode = this.$q.localStorage.getItem("displayMode") || "dm-sm";
  },

  computed: {
    ...mapStores(useCoreStore),
    filteredModels() {
      if (this.frmFamily == null) {
        return Array.from(this.coreStore.models.values());
      }
      return Array.from(this.coreStore.models.values()).filter(
        (m) => m.family_id === this.frmFamily?.id
      );
    },
    frmSearch: {
      get() {
        return this.coreStore.printerSearchParams.search;
      },
      set(v) {
        if (!v) {
          delete this.coreStore.printerSearchParams.search;
        } else {
          this.coreStore.printerSearchParams.search = v;
        }
      },
    },
    frmOrdering: {
      get() {
        return this.coreStore.printerSearchParams.ordering || "-submitted_at";
      },
      set(v) {
        if (!v) {
          delete this.coreStore.printerSearchParams.ordering;
        } else {
          this.coreStore.printerSearchParams.ordering = v;
        }
      },
    },
    frmFamily: {
      get() {
        return this.coreStore.families.get(
          this.coreStore.printerSearchParams.printer_model__family
        );
      },
      set(v) {
        if (v) {
          this.coreStore.printerSearchParams.printer_model__family = v?.id;
        } else {
          delete this.coreStore.printerSearchParams.printer_model__family;
        }
      },
    },
    frmModel: {
      get() {
        return this.coreStore.models.get(
          this.coreStore.printerSearchParams.printer_model
        );
      },
      set(v) {
        if (v) {
          this.coreStore.printerSearchParams.printer_model = v?.id;
        } else {
          delete this.coreStore.printerSearchParams.printer_model;
        }
      },
    },
    frmFrameColor: {
      get() {
        return this.coreStore.frameColors.get(
          this.coreStore.printerSearchParams.frame_color
        );
      },
      set(v) {
        if (v) {
          this.coreStore.printerSearchParams.frame_color = v?.id;
        } else {
          delete this.coreStore.printerSearchParams.frame_color;
        }
      },
    },
    frmPrimaryFilament: {
      get() {
        if (this.coreStore.printerSearchParams.primary_filament) {
          return this.coreStore.filaments.get(
            this.coreStore.printerSearchParams.primary_filament
          );
        } else if (
          this.coreStore.printerSearchParams.primary_filament__color_category
        ) {
          return this.coreStore.genericFilaments.get(
            this.coreStore.printerSearchParams.primary_filament__color_category
          );
        }

        return null;
      },
      set(v) {
        const psp = this.coreStore.printerSearchParams;
        if (v === null) {
          delete psp.primary_filament;
          delete psp.primary_filament__color_category;
        } else {
          if (v.manufacturer_id === 1) {
            delete psp.primary_filament;
            psp.primary_filament__color_category = v.color_category_id;
          } else {
            psp.primary_filament = v.id;
            delete psp.primary_filament__color_category;
          }
        }
      },
    },
    frmAccentFilament: {
      get() {
        if (this.coreStore.printerSearchParams.accent_filament) {
          return this.coreStore.filaments.get(
            this.coreStore.printerSearchParams.accent_filament
          );
        } else if (
          this.coreStore.printerSearchParams.accent_filament__color_category
        ) {
          return this.coreStore.genericFilaments.get(
            this.coreStore.printerSearchParams.accent_filament__color_category
          );
        }

        return null;
      },
      set(v) {
        const psp = this.coreStore.printerSearchParams;
        if (v === null) {
          delete psp.accent_filament;
          delete psp.accent_filament__color_category;
        } else {
          if (v.manufacturer_id === 1) {
            delete psp.accent_filament;
            psp.accent_filament__color_category = v.color_category_id;
          } else {
            psp.accent_filament = v.id;
            delete psp.accent_filament__color_category;
          }
        }
      },
    },
    frmMods: {
      get() {
        if (this.coreStore.printerSearchParams.mods) {
          return this.coreStore.printerSearchParams.mods;
        }
        return [];
      },
      set(v) {
        if (Array.isArray(v)) {
          this.coreStore.printerSearchParams.mods = v;
        } else {
          delete this.coreStore.printerSearchParams.mods;
        }
      },
    },
  },
  watch: {
    displayMode(newVal, oldVal) {
      this.$q.localStorage.set("displayMode", newVal);
      if (this.$refs.infScroll) {
        this.$refs.infScroll.poll();
      }
    },
    "$route.query": {
      handler(newVal, oldVal) {
        const params = toRaw(this.coreStore.printerSearchParams);
        const qs = {};
        for (let [k, v] of Object.entries(newVal)) {
          if (k === "mods") {
            if (!Array.isArray(v)) {
              v = [v];
            }
            v = v.map((val) => parseInt(val));
          } else if (k === "search" || k === "ordering") {
            // do nothing
          } else {
            v = parseInt(v);
          }
          qs[k] = v;
        }
        if (JSON.stringify(qs) !== JSON.stringify(params)) {
          this.coreStore.printerSearchParams = qs;
        }
      },
      eager: true,
    },
    "coreStore.printerSearchParams": {
      handler(newVal, oldVal) {
        for (let filter of this.coreStore.allFilters) {
          for (let field of filter.fields) {
            if (this[field]) {
              if (Array.isArray(this[field]) && this[field].length !== 0) {
                this.showFilter(filter);
              } else if (!Array.isArray(this[field])) {
                this.showFilter(filter);
              }
            }
          }
        }
        this.coreStore.newSearch();
        if (this.$refs.infScroll) {
          this.$refs.infScroll.reset();
          this.$refs.infScroll.resume();
        }
        this.$nextTick(() => {
          this.$router.replace({ query: newVal });
        });
      },
      eager: true,
      deep: true,
    },
  },
  components: {
    ModSelect,
    PrinterCard,
    FilamentPicker,
    FrameColorSelect,
    PageHeader,
  },
  data() {
    return {
      isMounted: false,
      displayMode: "dm-sm",
      loadingResults: false,
    };
  },
  methods: {
    showFilter(filter) {
      if (this.coreStore.shownFilters.indexOf(filter) === -1) {
        this.coreStore.shownFilters.push(filter);
      }
    },
    removeFilter(filter) {
      this.coreStore.shownFilters.splice(
        this.coreStore.shownFilters.indexOf(filter),
        1
      );
      for (let f of filter.fields) {
        this[f] = null;
      }
    },
    updateLikes(printerId, payload) {
      const p = this.coreStore.printerResults.filter(
        (r) => r.id == printerId
      )[0];
      p.user_liked = payload.user_liked;
      p.like_count = payload.like_count;
    },
    onResize(size) {
      this.$refs.infScroll.poll();
    },
    handleFamily(value) {
      this.coreStore.printerSearchParams.printer_model__family = value.id;
    },
    onScroll(index, done) {
      this.coreStore.fetchResults(index).then(() => {
        const isDone =
          this.coreStore.printerResults.length >=
          this.coreStore.printerResultCount;
        done(isDone);
      });
    },
  },
});
</script>
