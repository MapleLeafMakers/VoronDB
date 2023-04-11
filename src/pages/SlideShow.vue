<template>
  <q-page>
    <q-carousel
      v-if="ready"
      swipeable
      animated
      arrows
      :autoplay="30000"
      infinite
      transition-prev="scale"
      transition-next="scale"
      v-model="slide"
      v-model:fullscreen="fullscreen"
    >
      <q-carousel-slide
        v-for="printer of coreStore.printerResults"
        :name="printer.id"
        :img-src="printer.photos[0].photo"
        :key="printer.id"
      >
        <div class="caption">{{ displayName(printer) }}</div>
      </q-carousel-slide>

      <template v-slot:control> </template>
    </q-carousel>
    <q-spinner v-else color="primary" size="3em" />
  </q-page>
</template>
<style lang="scss">
.q-carousel__slides-container {
  background-color: black;
}
.q-carousel {
  height: calc(100vh - 50px);
}

.q-carousel__slide {
  text-align: center;
  background-size: contain;
  background-repeat: no-repeat;
}
.q-carousel__slide .caption {
  background: rgba(0, 0, 0, 0.75);
  color: white;
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  padding: 12px 18px;
  font-size: 3em;
  border-radius: 0.5em;
}
</style>
<script>
import { useCoreStore } from "src/stores/core";
import { mapStores } from "pinia";
export default {
  name: "SlideShow",
  async mounted() {
    this.coreStore.printerSearchParams = {};
    let page = 1;
    while (
      page == 1 ||
      this.coreStore.printerResultCount > this.coreStore.printerResults.length
    ) {
      await this.coreStore.fetchResults(page++);
    }

    this.ready = true;
  },

  computed: {
    ...mapStores(useCoreStore),
  },
  methods: {
    getModel(printer) {
      console.log(printer);
      console.log(this.coreStore.models);
      return this.coreStore.models.get(parseInt(printer.printer_model))
        .model_name;
    },
    displayName(printer) {
      let name = printer.printer_name || this.getModel(printer);
      name += ` by ${printer.submitted_by.username}`;
      return name;
    },
  },
  data() {
    return { slide: 1, fullscreen: false, ready: false };
  },
};
</script>
