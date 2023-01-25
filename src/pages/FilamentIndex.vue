<template>
  <q-page padding>
    <PageHeader
      title="Browse the Filament Database"
      icon="filament"
      caption="Use the form below to filter the results."
    >
      <template v-slot:append>
        <div style="flex-grow: 1; text-align: right">
          <q-btn
            icon="upload"
            label="Submit New Filaments"
            color="positive"
            to="/filament/add"
          />
        </div>
      </template>
    </PageHeader>

    <div class="row q-col-gutter-sm">
      <div class="col-8">
        <div class="relative-position">
          <q-select
            v-if="coreStore.loaded"
            filled
            v-model="selectedManufacturers"
            :options="
              Object.freeze(
                Array.from(coreStore.manufacturers.values()).filter(
                  (m) => m.id !== 1 && m.verified
                )
              )
            "
            label="Filter By Manufacturer"
            map-options
            multiple
            emit-value
          >
            <template v-slot:before-options>
              <q-item
                role="option"
                clickable
                @click="toggleAllManufacturers(!allManufacturersSelected)"
                class="sticky-top"
              >
                <q-item-section>
                  <q-item-label>All Manufacturers</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    :model-value="allManufacturersSelected"
                    @update:model-value="toggleAllManufacturers"
                  />
                </q-item-section>
              </q-item>
            </template>

            <template v-slot:selected-item="{ index }">
              <span v-if="index == 0"
                >{{ selectedManufacturers.length }} of
                {{ coreStore.manufacturers.size - 1 }} Selected</span
              >
            </template>
            <template
              v-slot:option="{ itemProps, opt, selected, toggleOption }"
            >
              <q-item v-bind="itemProps">
                <q-item-section>
                  <q-item-label>{{ opt.name }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    :model-value="selected"
                    @update:model-value="toggleOption(opt)"
                  />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>
      <div class="col-4">
        <div class="relative-position">
          <q-select
            v-if="coreStore.loaded"
            filled
            v-model="selectedTypes"
            :options="
              Object.freeze(
                Array.from(coreStore.types.values()).filter(
                  (m) => m.id !== 1 && m.verified
                )
              )
            "
            label="Filter By Type"
            multiple
            map-options
            emit-value
          >
            <template v-slot:before-options>
              <q-item
                role="option"
                clickable
                @click="toggleAllTypes(!allTypesSelected)"
                class="sticky-top"
              >
                <q-item-section>
                  <q-item-label>All Types</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    :model-value="allTypesSelected"
                    @update:model-value="toggleAllTypes"
                  />
                </q-item-section>
              </q-item>
            </template>

            <template v-slot:selected-item="{ index }">
              <span v-if="index == 0"
                >{{ selectedTypes.length }} of
                {{ coreStore.types.size - 1 }} Selected</span
              >
            </template>
            <template
              v-slot:option="{ itemProps, opt, selected, toggleOption }"
            >
              <q-item v-bind="itemProps">
                <q-item-section>
                  <q-item-label>{{ opt.name }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    :model-value="selected"
                    @update:model-value="toggleOption(opt)"
                  />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>
    </div>
    <q-separator class="q-my-sm" />
    <div class="row q-col-gutter-sm" v-if="coreStore.loaded">
      <div
        class="col-xs-2 col-md-1"
        v-for="fc of filteredFilaments"
        :key="fc.id"
      >
        <div
          class="swatch"
          :style="`background-color: ${fc.color}`"
          @click="showFilamentCard(fc)"
        ></div>
      </div>
    </div>
  </q-page>
</template>
<style lang="scss" scoped>
.sticky-top {
  position: sticky;
  top: 0px;
  z-index: 99;
}
.body--light .sticky-top {
  background-color: $grey-2;
  border-bottom: 1px solid $grey-3;
}
.body--dark .sticky-top {
  background-color: $dark;
  border-bottom: 1px solid $grey-9;
}
.swatch {
  display: block;
  aspect-ratio: 1;
  border: 1px solid silver;
  cursor: pointer;
}
.q-item--dark:not(.q-item--active) {
  color: $grey-7;
}
</style>
<script>
import { defineComponent, ref } from "vue";
import { useCoreStore } from "stores/core";
import { mapStores } from "pinia";
import FilamentCard from "components/FilamentCard.vue";
import PageHeader from "components/PageHeader.vue";
export default defineComponent({
  name: "FilamentIndex",
  components: { PageHeader },
  computed: {
    ...mapStores(useCoreStore),

    showCard: {
      get() {
        return this.selectedFilament !== null;
      },
      set(v) {
        if (!v) {
          this.selectedFilament = null;
        }
      },
    },
    selectedFilamentManufacturer() {
      return this.coreStore.manufacturers.get(
        this.selectedFilament.manufacturer_id
      );
    },
    selectedFilamentType() {
      return this.coreStore.types.get(this.selectedFilament.type_id);
    },
    allTypesSelected() {
      if (this.selectedTypes.length === 0) {
        return false;
      }
      if (this.selectedTypes.length === this.coreStore.types.size - 1) {
        return true;
      }
      return null;
    },

    allManufacturersSelected() {
      if (this.selectedManufacturers.length === 0) {
        return false;
      }
      if (
        this.selectedManufacturers.length ===
        this.coreStore.manufacturers.size - 1
      ) {
        return true;
      }
      return null;
    },
  },

  mounted() {
    this.coreStore.fetchData().then(() => {
      this.selectedManufacturers = Object.freeze(
        Array.from(this.coreStore.manufacturers.values()).filter(
          (m) => m.id !== 1
        )
      );
      this.selectedTypes = Object.freeze(
        Array.from(this.coreStore.types.values()).filter((t) => t.id !== 1)
      );
      this.filteredFilaments = Object.freeze(
        Array.from(this.coreStore.filaments.values())
      );
    });
  },

  methods: {
    showFilamentCard(filament) {
      this.$q.dialog({
        component: FilamentCard,
        componentProps: { filament: filament },
      });
    },
    toggleAllTypes(e) {
      if (e) {
        this.selectedTypes = Object.freeze(
          Array.from(this.coreStore.types.values()).filter((t) => t.id !== 1)
        );
      } else {
        this.selectedTypes = [];
      }
    },
    toggleAllManufacturers(e) {
      if (e) {
        this.selectedManufacturers = Object.freeze(
          Array.from(this.coreStore.manufacturers.values()).filter(
            (t) => t.id !== 1
          )
        );
      } else {
        this.selectedManufacturers = [];
      }
    },
    recompute() {
      const mids = this.selectedManufacturers.map((m) => m.id);
      const tids = this.selectedTypes.map((t) => t.id);

      this.filteredFilaments = Object.freeze(
        Array.from(this.coreStore.filaments.values()).filter(
          (f) =>
            mids.indexOf(f.manufacturer_id) !== -1 &&
            tids.indexOf(f.type_id) !== -1 &&
            f.verified
        )
      );
    },
  },
  watch: {
    selectedManufacturers() {
      this.recompute();
    },
    selectedTypes() {
      this.recompute();
    },
  },
  data() {
    return {
      selectedFilament: null,
      selectedManufacturers: [],
      selectedTypes: [],
      filteredFilaments: [],
    };
  },
});
</script>
