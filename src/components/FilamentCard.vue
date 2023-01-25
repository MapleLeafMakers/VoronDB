<template>
  <q-dialog ref="dialog">
    <q-card class="filament-card">
      <div
        class="large-swatch relative-position"
        :style="`background-color: ${filament.color}`"
      >
        <div class="color-codes q-pa-sm absolute-bottom row items-center">
          <div class="col-6 text-bold">{{ filament.color }} | {{ asRgb }}</div>
          <div class="col-6 text-right">
            <router-link
              v-if="primary_count"
              :to="{ name: 'index', query: { primary_filament: filament.id } }"
            >
              Primary color in
              {{ primary_count }} printer{{ primary_count > 1 ? "s" : "" }}
            </router-link>
            <router-link
              v-if="accent_count"
              :to="{ name: 'index', query: { accent_filament: filament.id } }"
            >
              Accent color in
              {{ accent_count }} printer{{ accent_count > 1 ? "s" : "" }}
            </router-link>
          </div>
        </div>
      </div>
      <q-list>
        <q-item>
          <q-item-section avatar>
            <q-icon size="xl" name="filament" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ filament.color_name }}</q-item-label>
            <q-item-label caption>
              {{ manufacturer.name }} {{ type.name }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn color="dark" v-close-popup>Close</q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-dialog>
</template>
<style scoped lang="scss">
.filament-card {
  width: 50vw;
}
.large-swatch {
  aspect-ratio: 4/3;
  width: 100%;
}
.large-swatch .color-codes {
  background-color: rgba(0, 0, 0, 0.5);
  color: $grey-6;
}
.color-codes a {
  display: block;
  color: $grey-6;
}
</style>
<script>
import { colors } from "quasar";

import { useDialogPluginComponent } from "quasar";
import { mapStores } from "pinia";
import { useCoreStore } from "stores/core";
export default {
  name: "FilamentCard",
  props: {
    filament: Object,
  },
  data() {
    return {
      primary_count: null,
      accent_count: null,
    };
  },
  emits: ["ok", "hide"],
  async mounted() {
    const detail = (await this.$api.get(`/api/filament/${this.filament.id}/`))
      .data;
    this.primary_count = detail.primary_count;
    this.accent_count = detail.accent_count;
  },
  computed: {
    ...mapStores(useCoreStore),
    manufacturer() {
      return this.coreStore.manufacturers.get(this.filament.manufacturer_id);
    },
    type() {
      return this.coreStore.types.get(this.filament.type_id);
    },
    asRgb() {
      const rgb = colors.hexToRgb(this.filament.color);
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    },
  },
  methods: {
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
