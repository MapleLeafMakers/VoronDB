<template>
  <q-select
    ref="qsel"
    filled
    :modelValue="modelValue"
    :options="options"
    @update:modelValue="handleChange"
    :label="label"
    :hint="hint"
    :error="error"
    :error-message="errorMessage"
    clearable
    lazy-rules="ondemand"
    :virtual-scroll-sticky-size-start="100"
    popup-content-class="relative-position"
  >
    <template v-slot:no-option>
      <div
        class="q-pa-md basic-advanced-toggle"
        style="position: sticky; top: 0px; z-index: 99"
      >
        <div class="row q-col-gutter-md">
          <div class="col-8">
            <q-input
              dense
              outlined
              clearable
              v-model="filterText"
              label="Search"
            />
          </div>
          <div class="col-4 text-right">
            <q-toggle
              left-label
              :label="advanced ? 'Advanced Mode' : 'Basic Mode'"
              v-model="advanced"
            />
          </div>
          <div v-if="advanced" class="col-8">
            <q-select
              dense
              outlined
              clearable
              label="Manufacturer"
              option-label="name"
              v-model="selectedMfg"
              :options="filteredFilamentManufacturers"
            ></q-select>
          </div>
          <div v-if="advanced" class="col-4">
            <q-select
              dense
              clearable
              outlined
              label="Type"
              option-label="name"
              v-model="selectedType"
              :options="filteredFilamentTypes"
            ></q-select>
          </div>
          <div class="col-12">
            <a href="#" @click="showFilamentForm">Add a new filament</a>
          </div>
        </div>
      </div>
    </template>

    <template v-slot:before-options>
      <div
        class="q-pa-md basic-advanced-toggle"
        style="position: sticky; top: 0px; z-index: 99"
      >
        <div class="row q-col-gutter-md">
          <div class="col-8">
            <q-input
              dense
              outlined
              clearable
              v-model="filterText"
              label="Search"
            />
          </div>
          <div class="col-4 text-right">
            <q-toggle
              left-label
              :label="advanced ? 'Advanced Mode' : 'Basic Mode'"
              v-model="advanced"
            />
          </div>
          <div v-if="advanced" class="col-8">
            <q-select
              dense
              outlined
              clearable
              label="Manufacturer"
              option-label="name"
              v-model="selectedMfg"
              :options="filteredFilamentManufacturers"
            ></q-select>
          </div>
          <div v-if="advanced" class="col-4">
            <q-select
              dense
              clearable
              outlined
              label="Type"
              option-label="name"
              v-model="selectedType"
              :options="filteredFilamentTypes"
            ></q-select>
          </div>
          <div v-if="advanced && this.allowAdd" class="col-12">
            <a href="#" @click="showFilamentForm">Add a new filament</a>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:selected-item="scope">
      <div class="flex no-wrap text-no-wrap overflow-hidden">
        <div
          class="swatch swatch-sm q-mr-sm"
          :style="'background-color: ' + scope.opt.color"
        ></div>
        <span>{{ selectedItemLabel }}</span>
      </div>
    </template>
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
          <q-item-label caption v-if="scope.opt.manufacturer_id !== 1"
            >{{ coreStore.manufacturers.get(scope.opt.manufacturer_id).name }}
            {{ coreStore.types.get(scope.opt.type_id).name }}</q-item-label
          >
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
<style lang="scss" scoped>
.body--light .basic-advanced-toggle {
  background-color: $grey-2;
  border-bottom: 1px solid $grey-3;
}
.body--dark .basic-advanced-toggle {
  background-color: $dark;
  border-bottom: 1px solid $grey-9;
}
.swatch {
  width: 2em;
  height: 2em;
  border: 1px solid silver;
  display: inline-block;
  flex-shrink: 0;
}
.swatch-sm {
  width: 1.5em;
  height: 1.5em;
}
</style>
<script>
import { uid } from "quasar";
import { defineComponent, ref } from "vue";
import { mapStores } from "pinia";
import { useCoreStore } from "stores/core.js";
import NewFilamentForm from "components/NewFilamentForm.vue";

export default defineComponent({
  name: "FilamentPicker",
  props: [
    "modelValue",
    "label",
    "hint",
    "error-message",
    "error",
    "unverified",
    "allow-add",
  ],
  computed: {
    ...mapStores(useCoreStore),
    selectedItemLabel() {
      const mv = this.modelValue;
      if (mv == null) {
        return null;
      } else if (mv.manufacturer_id === 1) {
        return mv.color_name;
      }
      const mfg = this.coreStore.manufacturers.get(mv.manufacturer_id).name;
      const type = this.coreStore.types.get(mv.type_id).name;

      return `${mv.color_name} (${mfg} ${type})`;
    },
    options() {
      const matches = (f, haystack) => {
        for (let token of this.filterText.split(/\s+/)) {
          if (haystack.indexOf(token.toLowerCase()) === -1) return false;
        }
        return true;
      };
      if (this.advanced) {
        return Object.freeze(
          Array.from(this.coreStore.filaments.values()).filter((f) => {
            if (f.manufacturer_id === 1) return false;
            if (this.selectedMfg && f.manufacturer_id !== this.selectedMfg.id) {
              return false;
            }
            if (this.selectedType && f.type_id !== this.selectedType.id) {
              return false;
            }
            if (f.verified === false && !this.unverified) {
              return false;
            }
            if (this.filterText) {
              const mfg = this.coreStore.manufacturers.get(f.manufacturer_id);
              const type = this.coreStore.types.get(f.type_id);
              const haystack =
                `${f.color_name} ${mfg.name} ${type.name}`.toLowerCase();
              return matches(f, haystack);
            }
            return true;
          })
        );
      }
      return Object.freeze(
        Array.from(this.coreStore.filaments.values()).filter(
          (f) =>
            f.manufacturer_id === 1 &&
            (this.filterText == null || matches(f, f.color_name.toLowerCase()))
        )
      );
    },
    filteredFilamentManufacturers() {
      return Object.freeze(
        Array.from(this.coreStore.manufacturers.values()).filter(
          (m) => m.id !== 1 && (this.unverified || m.verified !== null)
        )
      );
    },
    filteredFilamentTypes() {
      let types = Array.from(this.coreStore.types.values()).filter((t) => {
        if (t.id === 1) return false;
        if (t.verified === false && !this.unverified) return false;
        return true;
      });

      if (this.selectedMfg) {
        return types.filter((t) => {
          return Array.from(this.coreStore.filaments.values()).some(
            (f) =>
              f.manufacturer_id === this.selectedMfg.id && f.type_id == t.id
          );
        });
      }
      return types;
    },
  },

  data() {
    return {
      selectedMfg: null,
      selectedType: null,
      advanced: false,
      filterText: "",
    };
  },
  watch: {
    filteredFilamentTypes(newVal, oldVal) {
      if (
        this.selectedType !== null &&
        newVal.indexOf(this.selectedType) === -1
      ) {
        this.selectedType = null;
      }
    },
    modelValue(newVal, oldVal) {
      if (!newVal) {
        this.advanced = false;
        this.selectedMfg = null;
        this.selectedType = null;
      } else {
        this.advanced = newVal.manufacturer_id !== 1;
        if (this.advanced) {
          this.selectedMfg = this.coreStore.manufacturers.get(
            newVal.manufacturer_id
          );
          this.selectedType = this.coreStore.types.get(newVal.type_id);
        } else {
          this.selectedMfg = null;
          this.selectedType = null;
        }
      }
    },
  },
  methods: {
    showFilamentForm(e) {
      this.$q
        .dialog({
          component: NewFilamentForm,
          componentProps: {},
        })
        .onOk((arg) => {
          if (typeof arg.manufacturer === "object") {
            arg.manufacturer_id = arg.manufacturer.id;
          } else if (typeof arg.manufacturer === "string") {
            const mid = uid();
            this.coreStore.manufacturers.set(mid, {
              name: arg.manufacturer,
              id: mid,
            });
            arg.manufacturer_id = mid;
          }
          delete arg.manufacturer;

          if (typeof arg.type === "object") {
            arg.type_id = arg.type.id;
          } else if (typeof arg.type === "string") {
            const tid = uid();
            this.coreStore.types.set(tid, {
              name: arg.type,
              id: tid,
            });
            arg.type_id = tid;
          }
          delete arg.type;
          const fid = uid();
          const filament = { ...arg, id: fid };
          this.coreStore.filaments.set(fid, filament);
          this.$emit("update:modelValue", filament);
          this.$refs.qsel.hidePopup();
        });
    },
    handleChange(newVal) {
      this.$emit("update:modelValue", newVal);
    },
    filterFn(val, update) {
      update(() => {
        this.filterText = val;
      });
    },
  },
});
</script>
