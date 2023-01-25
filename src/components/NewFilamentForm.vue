<template>
  <q-dialog ref="dialog">
    <q-card style="width: 75vw; max-width: 75vw">
      <q-card-section>
        <div class="text-h6">Submit a new filament</div>
      </q-card-section>
      <q-card-section>
        <q-form greedy @submit="handleSubmit">
          <div class="row q-col-gutter-sm">
            <div class="col-xs-12 col-md-4 col-lg-2">
              <q-color
                format-model="hex"
                square
                flat
                v-model="color"
                no-header-tabs
                no-footer
                lazy-rules="ondemand"
                :rules="[(val) => val != undefined || 'This field is required']"
              />
            </div>
            <div class="col-xs-12 col-md-8 col-lg-10">
              <q-select
                label="Manufacturer"
                new-value-mode="add-unique"
                use-input
                @filter="mfgFilterFn"
                :options="filteredFilamentManufacturers"
                option-label="name"
                option-value="id"
                map-options
                v-model="manufacturer"
                lazy-rules="ondemand"
                :rules="[(val) => val != undefined || 'This field is required']"
              />
              <q-select
                label="Material Type"
                new-value-mode="add-unique"
                use-input
                @filter="typeFilterFn"
                :options="filteredFilamentTypes"
                option-label="name"
                option-value="id"
                map-options
                v-model="type"
                lazy-rules="ondemand"
                :rules="[(val) => val != undefined || 'This field is required']"
              />
              <q-select
                label="Color Category"
                v-model="color_category"
                :options="Array.from(this.coreStore.genericFilaments.values())"
                map-options
                option-value="color_category_id"
                option-label="color_name"
                lazy-rules="ondemand"
                :rules="[(val) => val != undefined || 'This field is required']"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" dense>
                    <q-item-section side>
                      <div
                        class="swatch"
                        :style="'background-color: ' + scope.opt.color"
                      ></div>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.color_name }}</q-item-label>
                      <q-item-label
                        caption
                        v-if="scope.opt.manufacturer_id !== 1"
                        >{{
                          coreStore.manufacturers.get(scope.opt.manufacturer_id)
                            .name
                        }}
                        {{
                          coreStore.types.get(scope.opt.type_id).name
                        }}</q-item-label
                      >
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-input
                v-model="color_name"
                label="Color Name"
                lazy-rules="ondemand"
                :rules="[(val) => val != undefined || 'This field is required']"
              />
              <q-select
                label="Source"
                :options="sourceOptions"
                v-model="source"
                map-options
                lazy-rules="ondemand"
                :rules="[(val) => val != undefined || 'This field is required']"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption>{{
                        scope.opt.caption
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <div class="text-right q-mt-sm">
            <q-btn
              label="Cancel"
              class="q-mr-sm"
              color="negative"
              @click="hide"
            />
            <q-btn type="submit" label="OK" color="positive" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<style scoped lang="scss">
.swatch {
  width: 2em;
  height: 2em;
  border: 1px solid silver;
  display: inline-block;
  flex-shrink: 0;
}
</style>
<script>
import { useDialogPluginComponent } from "quasar";
import { mapStores } from "pinia";
import { useCoreStore } from "stores/core";
export default {
  name: "NewFilamentForm",
  props: {},
  computed: {
    ...mapStores(useCoreStore),
    filteredFilamentManufacturers() {
      return Object.freeze(
        Array.from(this.coreStore.manufacturers.values()).filter(
          (m) =>
            m.id !== 1 &&
            m.verified !== false &&
            m.name.toLowerCase().indexOf(this.mfgFilter.toLowerCase()) !== -1
        )
      );
    },
    filteredFilamentTypes() {
      let types = Array.from(this.coreStore.types.values()).filter((t) => {
        return (
          t.id !== 1 &&
          t.verified !== false &&
          t.name.toLowerCase().indexOf(this.typeFilter.toLowerCase()) !== -1
        );
      });
      return types;
    },
  },
  data() {
    return {
      sourceOptions: [
        {
          value: "guess",
          label: "Best Guess",
          caption:
            "Your color code is just a guess (including comparison to online RAL / Pantone color charts)",
        },
        {
          value: "measurement",
          label: "Measurement",
          caption:
            "You used a tool such as a colorimeter to measure a printed filament sample",
        },
        {
          value: "datasheet",
          label: "Manufacturer Datasheet",
          caption: "The color code was provided by the filament manufacturer",
        },
        {
          value: "visual",
          label: "Visual comparison",
          caption:
            "A printed filament sample was compared to a reference (Pantone or RAL printed color chart or reference chip)",
        },
      ],
      typeFilter: "",
      mfgFilter: "",
      manufacturer: null,
      type: null,
      source: null,
      color_category: null,
      color_name: null,
      color: null,
    };
  },
  emits: ["ok", "hide"],
  methods: {
    handleSubmit(e) {
      const obj = {
        manufacturer: this.manufacturer,
        type: this.type,
        color_category_id: this.color_category.color_category_id,
        color_name: this.color_name,
        color: this.color,
        source: this.source.value,
      };
      this.$emit("ok", obj);
      this.$refs.dialog.hide();
    },
    mfgFilterFn(val, update) {
      update(() => {
        this.mfgFilter = val;
      });
    },
    typeFilterFn(val, update) {
      update(() => {
        this.typeFilter = val;
      });
    },
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialog.hide();
    },
  },
};
</script>
