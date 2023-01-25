<template>
  <q-page padding>
    <div class="row flex items-center q-mb-sm">
      <q-avatar size="xl" class="q-mr-md" v-if="userInfo?.avatar"
        ><img :src="userInfo?.avatar" @error="userInfo.avatar = null"
      /></q-avatar>
      <q-avatar v-else size="xl" class="q-mr-md">
        <q-icon size="xl" class="q-ml-xs" name="person"></q-icon>
      </q-avatar>
      <div>
        <span class="text-h4"
          >{{ userInfo?.username }}#{{ userInfo?.discriminator }}</span
        >
        <p class="q-mb-none caption">
          Member since
          {{ new Date(userInfo?.date_joined).toLocaleDateString() }}
        </p>
      </div>
    </div>
    <q-separator class="q-mb-lg" />
    <div class="text-h6">{{ userInfo?.username }}'s Printers</div>
    <div v-if="coreStore.loaded" class="row q-col-gutter-lg items-stretch">
      <PrinterCard
        :link-submitted-by="false"
        v-for="printer of coreStore.userPrinters"
        :printer="printer"
        :key="printer.id"
        display-mode="dm-sm"
        @update-likes="updateLikes"
      />
    </div>
  </q-page>
</template>
<style lang="scss" scoped>
.caption {
  color: rgba(0, 0, 0, 0.5);
}
.body--dark .caption {
  color: rgba(255, 255, 255, 0.5);
}
</style>
<script>
import { useCoreStore } from "stores/core";
import { mapStores } from "pinia";
import PrinterCard from "components/PrinterCard.vue";

export default {
  name: "UserPrinters",
  components: { PrinterCard },
  created() {
    this.$api
      .get(`/api/user/${this.coreStore.userPrinters[0].submitted_by.id}/`)
      .then((resp) => {
        this.userInfo = resp.data;
      });
  },
  data() {
    return {
      userInfo: null,
    };
  },
  computed: {
    ...mapStores(useCoreStore),
  },
  methods: {
    updateLikes(printerId, payload) {
      const p = this.coreStore.userPrinters.filter((r) => r.id == printerId)[0];
      p.user_liked = payload.user_liked;
      p.like_count = payload.like_count;
    },
  },
};
</script>
