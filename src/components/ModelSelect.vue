<template>
  <div>
    <q-select
      :model-value="modelValue"
      @update:modelValue="handleValueChange"
      :options="options"
      filled
      option-label="model_name"
      label="Model"
      ref="qSelect"
      lazy-rules="ondemand"
      hint="Select your printer model"
      :rules="[(val) => val != undefined || 'This field is required']"
    >
      <template v-slot:selected-item="{ opt }"
        ><div>
          <q-icon :name="opt.icon" class="q-mr-sm"></q-icon>
          {{ opt.model_name }}
        </div>
      </template>
      <template v-slot:before-options>
        <q-tree
          :nodes="nodes"
          node-key="node_id"
          v-model:selected="selected"
          v-model:expanded="expanded"
          accordion
          @update:selected="handleSelectionChange"
        />
      </template>
      <template v-slot:option></template>
    </q-select>
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useCoreStore } from "stores/core";

export default {
  name: "ModelSelect",
  props: ["modelValue", "options"],
  computed: {
    ...mapStores(useCoreStore),
    nodes() {
      const roots = Array.from(this.coreStore.families.values()).map((f) => {
        return {
          label: f.name,
          header: f.id,
          selectable: false,
          id: f.id,
          node_id: `f-${f.id}`,
          children: Array.from(this.coreStore.models.values())
            .filter((m) => m.family_id === f.id)
            .map((m) => {
              return {
                node_id: m.id,
                label: m.model_name,
                icon: m.icon,
                id: m.id,
              };
            }),
        };
      });
      return roots;
    },
  },
  methods: {
    handleSelectionChange(e) {
      const model = this.coreStore.models.get(e);
      this.$emit("update:modelValue", model);
      this.$refs.qSelect.hidePopup();
      this.$refs.qSelect.focus();
    },
    handleValueChange(e) {
      this.$emit("update:modelValue", e);
    },
  },
  data() {
    return {
      expanded: null,
      selected: null,
    };
  },
};
</script>
