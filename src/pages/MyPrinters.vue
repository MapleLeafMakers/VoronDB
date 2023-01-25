<template>
  <q-page padding>
    <PageHeader
      title="My Printers"
      icon="list"
      caption="View or update your printer submissions"
    />

    <q-separator class="q-mb-md" />
    <div class="row q-col-gutter-lg items-stretch" v-if="coreStore.loaded">
      <div
        class="col-xs-6 col-md-4 col-lg-3"
        v-for="printer of results"
        :key="printer.id"
      >
        <MyPrinterCard
          :printer="printer"
          @view-click="handleViewClick"
          @delete-click="handleDeleteClick"
        />
      </div>
    </div>
    <div v-if="resultsLoaded && results.length == 0" class="q-mt-lg">
      <div class="text-h6 text-center q-pa-lg">
        <div>You haven't submitted any printers yet.</div>
        <q-btn
          class="q-ma-lg"
          color="positive"
          to="/new"
          label="Submit your printer"
          icon="upload"
          size="xl"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { shallowRef } from "vue";
import { useCoreStore } from "stores/core";
import { mapStores } from "pinia";
import MyPrinterCard from "components/MyPrinterCard.vue";
import PageHeader from "components/PageHeader.vue";
export default {
  name: "MyPrinters",
  computed: {
    ...mapStores(useCoreStore),
  },
  components: { MyPrinterCard, PageHeader },
  async mounted() {
    this.results = shallowRef((await this.$api.get("/api/printer/mine/")).data);
    this.resultsLoaded = true;
  },
  methods: {
    handleViewClick(printerId) {
      this.$router.push(`/printer/${printerId}`);
    },
    handleDeleteClick(printerId) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to delete this printer?",
          ok: {
            label: "Yes, Delete",
            color: "negative",
          },
          cancel: {
            label: "No, Cancel",
          },
          persistent: false,
        })
        .onOk(() => {
          this.$api
            .delete(`/api/printer/${printerId}/`, {
              headers: { "X-CSRFToken": this.$q.cookies.get("csrftoken") },
            })
            .then((data) => {
              if (data.status !== 204) {
                this.$q.notify({
                  type: "negative",
                  message: "Something went wrong, try again later.",
                });
              } else {
                this.$q.notify({
                  type: "positive",
                  message: "Your submission has been deleted.",
                });
                this.$api.get("/api/printer/mine/").then((response) => {
                  this.results = shallowRef(response.data);
                });
              }
            });
        });
    },
  },
  data() {
    return {
      selectedPrinter: null,
      results: shallowRef([]),
      resultsLoaded: false,
    };
  },
};
</script>
