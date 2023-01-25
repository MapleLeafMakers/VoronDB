<template>
  <q-page padding>
    <PageHeader
      title="Config Backups"
      icon="backup"
      :caption="printerDisplayName"
    >
      <template v-slot:prepend>
        <q-btn
          icon="arrow_back"
          size="xl"
          class="q-mr-md"
          rounded
          flat
          @click="
            $router.options.history.state.back
              ? $router.back()
              : $router.push('/')
          "
        >
          <q-tooltip>Go Back</q-tooltip>
        </q-btn>
      </template>
    </PageHeader>
    <q-separator class="q-mb-md" />
    <div class="row q-col-gutter-lg">
      <div class="col-xs-12 col-sm-6">
        <div v-if="!has_auth_token" class="text-center">
          <p>
            You haven't configured backups for this printer yet, Generate an API
            Key to get started now!
          </p>
          <q-btn
            label="generate api key"
            icon="key"
            color="dark"
            @click="generateAPIKey"
          />
        </div>
        <div v-else>
          You can use your API Key to upload backups of your printer
          configuration to vorondb.
          <div class="rounded-corners q-ma-lg">
            <q-tabs
              align="left"
              v-model="tab"
              dense
              color="dark"
              class="bg-dark text-grey-6"
              narrow-indicator
              inline-label
            >
              <q-tab name="backup" icon="backup" label="Backup" />
              <q-tab name="download" icon="download" label="Restore" />
            </q-tabs>
            <q-tab-panels v-model="tab" animated class="bg-black">
              <q-tab-panel name="backup">
                <pre
                  class="text-white"
                >tar -cz --sort=name --exclude='printer-????????_??????.cfg'
    -C <span class="variable">/home/pi/printer_data/config/</span> . | \
curl --data-binary @- \
    -H 'Authorization: Token {{ auth_token }}' \
    {{ hostname}}/api/printer/{{ printerId }}/config/</pre>
              </q-tab-panel>
              <q-tab-panel name="download">
                <pre class="text-white">
curl -H 'Authorization: Token {{ auth_token }}' \
    {{ hostname }}/api/printer/{{ printerId }}/config/latest/download/ | tar -xz -C <span class="variable">/home/pi/printer_data/config</span>
                </pre>
              </q-tab-panel>
            </q-tab-panels>
          </div>

          <q-input
            ref="keyInput"
            v-model="auth_token"
            filled
            label="API Key"
            :type="showKey ? 'text' : 'password'"
          >
            <template v-slot:prepend>
              <q-icon name="key" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showKey ? 'content_paste' : 'visibility'"
                class="cursor-pointer"
                @click="toggleShowKey"
              >
                <q-tooltip>{{
                  showKey ? "Copy to clipboard" : "Show API Key"
                }}</q-tooltip>
              </q-icon>
            </template>
          </q-input>
          <q-btn
            v-if="showKey"
            class="q-mt-md"
            color="dark"
            @click="confirmRegenerate"
            icon="refresh"
            label="Regenerate API Key"
          />
        </div>
      </div>
      <div class="col-xs-12 col-sm-6">
        <q-list separator bordered class="rounded-borders">
          <q-item class="bg-dark text-grey-6 rounded-borders">
            <q-item-section avatar>
              <q-icon name="backup" />
            </q-item-section>
            <q-item-section label> Previous Backups </q-item-section>
          </q-item>
          <q-item v-if="backups.length == 0">
            <q-item-section> You don't have any backups. </q-item-section>
          </q-item>
          <q-item
            v-for="backup of backups"
            :key="backup.id"
            clickable
            @click="download(backup)"
          >
            <q-item-section avatar>
              <q-icon name="folder_zip"></q-icon>
            </q-item-section>
            <q-item-section>
              <q-item-label
                >backup_{{ tsFormat(backup.timestamp) }}.tar.gz</q-item-label
              >
              <q-item-label caption>
                Created {{ new Date(backup.timestamp) }}
              </q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-icon name="download" />
            </q-item-section>
          </q-item>
          <iframe id="download-iframe"></iframe>
        </q-list>
      </div>
    </div>
  </q-page>
</template>
<style lang="scss" scoped>
.script-example {
  border: 1px solid $grey-6;
}

#download-iframe {
  display: none;
}
span.variable {
  color: $positive;
}
</style>
<script>
import { mapStores } from "pinia";
import { useCoreStore } from "stores/core";
import { date } from "quasar";
import PageHeader from "components/PageHeader.vue";
export default {
  name: "ConfigBackups",
  components: { PageHeader },
  props: ["printerId", "printer"],
  data() {
    return {
      showKey: false,
      auth_token: "****************************************",
      files: "",
      backups: [],
      disableGenerateButton: false,
      tab: "backup",
      has_new_auth_token: null,
    };
  },
  computed: {
    ...mapStores(useCoreStore),
    hostname() {
      return window.location.origin;
    },
    printerDisplayName() {
      if (this.printer.printer_name) {
        return `${this.printer.printer_name} (${this.printerModel.model_name})`;
      }
      return this.printerModel.model_name;
    },
    has_auth_token() {
      if (this.has_new_auth_token != null) {
        return true;
      }
      return this.printer.has_auth_token;
    },
    printerModel() {
      return this.coreStore.models.get(this.printer.printer_model);
    },
  },
  mounted() {
    this.$api.get(`/api/printer/${this.printerId}/config/`).then((response) => {
      this.backups = response.data;
    });
  },
  methods: {
    confirmRegenerate() {
      this.$q
        .dialog({
          title: "Confirm",
          message:
            "Are you sure you want to regenerate your API Key?  This will disconnect all backup scripts until they are updated with the new key.",
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.generateAPIKey();
        });
    },
    download(backup) {
      document.getElementById(
        "download-iframe"
      ).src = `/api/printer/${this.printerId}/config/${backup.id}/download/`;
    },
    tsFormat(dt) {
      return date.formatDate(dt, "YYYYMMDDHHmmss");
    },
    async generateAPIKey() {
      this.disableGenerateButton = true;
      let resp;
      try {
        resp = await this.$api.post(
          `/api/printer/${this.printerId}/config/api-key/`,
          {},
          { headers: { "X-CSRFToken": this.$q.cookies.get("csrftoken") } }
        );
      } finally {
        this.auth_token = resp.data.key;
        this.showKey = true;
        this.has_new_auth_token = true;
        this.disableGenerateButton = false;
      }
    },
    async toggleShowKey(e) {
      if (this.showKey) {
        // already showing key, copy to clipboard.
        this.$refs.keyInput.select();
        navigator.clipboard.writeText(this.auth_token);
        this.$q.notify({
          color: "positive",
          message: "API Key has been copied to the clipboard.",
        });
      } else {
        const resp = await this.$api.get(
          `/api/printer/${this.printerId}/config/api-key/`
        );
        this.auth_token = resp.data.key;
        this.showKey = true;
      }
    },
    async go() {
      const resp = await this.$api.post(
        `/api/printer/${this.printerId}/config/`,
        { files: this.files },
        { headers: { "X-CSRFToken": this.$q.cookies.get("csrftoken") } }
      );
    },
  },
};
</script>
