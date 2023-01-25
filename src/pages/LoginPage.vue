<template>
  <q-page padding>
    <div class="text-h6 text-center">
      <div class="q-my-xl">You are not signed in.</div>
      <form action="/accounts/discord/login/?process=login" method="POST">
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

export default {
  name: "LoginPage",
  computed: {
    ...mapStores(useCoreStore),
  },
};
</script>
