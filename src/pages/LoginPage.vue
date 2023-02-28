<template>
  <q-page padding>
    <div class="text-h6 text-center">
      <div class="q-my-xl">You are not signed in.</div>
      <form :action="loginUrl" method="POST">
        <input
          name="csrfmiddlewaretoken"
          type="hidden"
          :value="$q.cookies.get('csrftoken')"
        />
        <q-btn
          size="xl"
          style="background-color: #7289da"
          icon="discord"
          label="Sign-in with Discord"
          type="submit"
        />
      </form>
    </div>
  </q-page>
</template>

<script>
import { mapStores } from "pinia";
import { useCoreStore } from "stores/core";
import { onMounted } from "vue";

export default {
  name: "LoginPage",
  computed: {
    ...mapStores(useCoreStore),
  },
  data() {
    return {
      loginUrl: "/accounts/discord/login/?process=login",
    };
  },
  mounted() {
    console.log(`mounted login with ${this.loginUrl}`);
    if (Object.keys(this.$route.query).length) {
      this.loginUrl = `${this.loginUrl}&${new URLSearchParams(
        this.$route.query
      ).toString()}`;
    }
  },
};
</script>
