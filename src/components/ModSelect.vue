<template>
  <q-select
    filled
    :model-value="modelValue"
    @update:model-value="handleUpdate"
    :options="filteredOptions"
    label="Installed Mods"
    multiple
    emit-value
    option-value="id"
    map-options
    use-chips
    clearable
    :virtual-scroll-sticky-size-start="50"
  >
    <template v-slot:no-option>
      <div class="q-pa-sm filter-panel row q-col-gutter-sm">
        <div class="col-xs-12 col-sm-8">
          <q-input
            dense
            outlined
            clearable
            label="Search mods"
            v-model="filter"
          />
        </div>
        <div class="col-xs-12 col-sm-4">
          <q-option-group
            v-model="compatFilter"
            :options="[
              { label: 'VS', value: 'VS' },
              { label: 'VT', value: 'VT' },
              { label: 'V0', value: 'V0' },
              { label: 'V1', value: 'V1' },
              { label: 'V2', value: 'V2' },
            ]"
            type="checkbox"
            color="dark"
            inline
          />
        </div>
      </div>
      <h6 class="text-center">No matches found</h6>
    </template>

    <template v-slot:before-options>
      <div class="q-pa-sm filter-panel row q-col-gutter-sm">
        <div class="col-xs-12 col-sm-8">
          <q-input
            dense
            outlined
            clearable
            label="Search mods"
            v-model="filter"
          />
        </div>
        <div class="col-xs-12 col-sm-4">
          <q-option-group
            v-model="compatFilter"
            :options="[
              { label: 'VS', value: 'VS' },
              { label: 'VT', value: 'VT' },
              { label: 'V0', value: 'V0' },
              { label: 'V1', value: 'V1' },
              { label: 'V2', value: 'V2' },
            ]"
            type="checkbox"
            color="dark"
            inline
          />
        </div>
      </div>
    </template>

    <template v-slot:selected-item="scope">
      <q-chip
        removable
        dense
        @remove="scope.removeAtIndex(scope.index)"
        :tabindex="scope.tabindex"
        class="q-ma-xs"
      >
        {{ scope.opt.name }}
      </q-chip>
    </template>

    <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
      <q-item v-bind="itemProps">
        <q-item-section side>
          <q-checkbox
            color="dark"
            :model-value="selected"
            @update:model-value="toggleOption(opt)"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ opt.name }}</q-item-label>
          <q-item-label caption
            >by {{ opt.author }} [{{ opt.install_count }} install{{
              opt.install_count > 1 ? "s" : ""
            }}]</q-item-label
          >
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
<style lang="scss" scoped>
.q-item--active,
.q-item--active .text-caption {
  color: $grey-4;
}
.body--dark .q-item--active,
.body--dark .q-item--active .text-caption {
  color: $grey-8;
}
.q-item--dark .q-item__label--caption {
  color: rgba(255, 255, 255, 0.5);
}
.filter-panel {
  position: sticky;
  top: 0px;
  z-index: 99;
}
.body--light .filter-panel {
  background-color: $grey-2;
  border-bottom: 1px solid $grey-3;
}
.body--dark .filter-panel {
  background-color: $dark;
  border-bottom: 1px solid $grey-9;
}
</style>

<script>
import { mapStores } from "pinia";
import { useCoreStore } from "stores/core";

export default {
  name: "ModSelect",
  props: ["modelValue", "installedOnly"],
  data() {
    return {
      filter: "",
      compatFilter: ["VS", "VT", "V0", "V1", "V2"],
    };
  },

  computed: {
    ...mapStores(useCoreStore),
    filteredOptions() {
      const needle = (this.filter || "").toLowerCase();
      const installedOnly = this.installedOnly;
      const arr = Object.freeze(
        Array.from(this.coreStore.mods.values()).filter((m) => {
          const txtMatch =
            `${m.name} ${m.author}`.toLowerCase().indexOf(needle) !== -1;
          const compatMatch =
            m.compatibility.filter((c) => this.compatFilter.indexOf(c) !== -1)
              .length > 0;
          const installMatch = m.install_count > 0 || !installedOnly;
          return txtMatch && compatMatch && installMatch;
        })
      );

      return arr;
    },
  },
  methods: {
    handleUpdate(e) {
      this.$emit("update:modelValue", e);
    },
    updateFilter(val, update, abort) {
      update(() => {
        this.filter = val;
      });
    },
  },
};
</script>
