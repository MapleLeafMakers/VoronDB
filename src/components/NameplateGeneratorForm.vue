<template>
  <q-form
    greedy
    class="q-gutter-xs"
    v-if="coreStore.loaded"
    @submit="handleSubmit"
  >
    <div class="row q-col-gutter-md">
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <ModelSelect
              v-model="model"
              :options="Array.from(coreStore.models.values())"
            />
          </div>

          <div class="col-6">
            <q-input
              name="serial_number"
              type="number"
              lazy-rules="ondemand"
              :disable="!family?.short_name"
              filled
              v-model="serial_number"
              label="Serial number"
              hint="If you have a serial # enter it here"
              :prefix="`${family?.short_name}.`"
            />
          </div>

          <div class="col-12">
            <q-btn
              :disable="submitting"
              label="Generate Nameplate"
              icon="upload"
              type="submit"
              color="dark"
            />
            <q-btn
              label="Cancel"
              icon="close"
              @click.stop="$router.back()"
              color="dark"
              class="q-ml-md"
            />
          </div>
        </div>
      </div>
  </q-form>
</template>
<style lang="scss">
div.q-field__prefix {
  padding-right: 0px;
}
</style>
<script>
import { useCoreStore } from "stores/core";
import { mapStores } from "pinia";

import ModelSelect from "components/ModelSelect.vue";

export default {
  name: "NameplateGeneratorForm",
  components: {
    ModelSelect,
  },
  watch: {
       model: function (newVal, oldVal) {
      if (newVal) {
        this.family = this.coreStore.families.get(this.model.family_id);
      } else {
        this.family = null;
      }
    },
  },
  computed: {
    ...mapStores(useCoreStore),
  },
  methods: {
    
    setFilamentValue(formData, key, fId) {
      
    },
    async handleSubmit(event) {
      this.$emit("saved", { model: this.family.short_name, serial_number: this.serial_number });
    },
    handleReset(event) {
      this.$emit("reset", event);
    },
  },
  mounted() {
  },
  data() {
    return {
      submitting: false,
      model: null,
      family: null,
      serial_number: null
    };
  },
};
</script>
