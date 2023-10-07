<template>
  <q-page padding>
    <PageHeader
      title="Nameplate Generator"
      icon="badge"
      caption="Fill out the form below to download a printable nameplate for your Voron"
    />
   <q-form
    greedy
    class="q-gutter-xs"
    v-if="coreStore.loaded"
    @submit="handleSubmit"
  >
    <div class="row q-col-gutter-md">
          <div class="col-4">
            <q-select v-model="family" label="Printer Model" option-value="short_name" option-label="name" filled class="q-mb-sm"
            :options="Array.from(coreStore.families.values())" />            
            <q-input
              name="serial_number"
              type="number"
              lazy-rules="ondemand"
              :disable="!family?.short_name"
              filled
              v-model="serial_number"
              label="Serial number"
              :prefix="`${family?.short_name}.`"
              class="q-mb-sm"
            />

            <q-input v-model.number="panel_thickness" type="number" :min='0' :max='10' :step='0.5' label="Panel Thickness" filled suffix="mm" v-if="family !== 'V0'" hint="Including foam thickness" />
            <q-checkbox v-model="logo" color="dark" label="Include Voron Logo" class="q-mb-sm"  />
            
            <div>
              <q-btn
                :disable="submitting"
                label="Generate Nameplate"
                icon="upload"
                type="submit"
                color="dark"
              /> 
            </div>
          </div>
        </div>
  </q-form>
  </q-page>
</template>

<script>

import PageHeader from "components/PageHeader.vue";
import { useCoreStore } from "stores/core";
import { mapStores } from "pinia";

// import ModelSelect from "components/ModelSelect.vue";

export default {
  name: "NameplateGenerator",
  methods: {
    async handleSubmit() {
      this.submitting = true;
      const resp = await this.$api.post(
        "/api/nameplate-generator/", 
        { model: this.family.short_name, serial_number: this.serial_number } ,
        {
          responseType: 'arraybuffer',
          headers: { "X-CSRFToken": this.$q.cookies.get("csrftoken") } 
        }
      )
      const el = document.createElement("a");
      el.href = URL.createObjectURL(new Blob([resp.data]));
      el.download = `${this.family.short_name}-${this.serial_number}.stl`;
      el.click();
      setTimeout(() => {
        URL.revokeObjectURL(el.href);
        el.remove();
      }, 500);
      this.submitting = false;
    }
  },
  computed: {
    ...mapStores(useCoreStore),
  },
  
  components: { 
    PageHeader
  },
  data() {
    return {
      logo: true,
      family: null,
      serial_number: null,
      panel_thickness: 3,
      submitting: false
    };
  },
};
</script>
