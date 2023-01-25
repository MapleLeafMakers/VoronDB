<template>
  <q-page padding>
    <PageHeader
      title="Contact Us"
      icon="mail"
      caption="Use the form below to send us your comments."
    />
    <q-form padding @submit="onSubmit">
      <div class="row q-col-gutter-md">
        <q-input
          :disable="sending"
          class="col-12"
          name="name"
          filled
          v-model="name"
          label="Your name"
        />
        <q-input
          :disable="sending"
          class="col-12"
          type="email"
          name="email"
          filled
          v-model="email"
          label="Your email address"
        />
        <q-input
          :disable="sending"
          class="col-12"
          filled
          autogrow
          name="message"
          v-model="message"
          label="Your message"
        />
      </div>
      <div class="row q-col-gutter-md">
        <div class="col-12 text-right">
          <q-btn
            :disable="sending"
            class="q-mt-lg"
            type="submit"
            label="send"
            icon="mail"
            color="dark"
          />
        </div>
      </div>
    </q-form>
  </q-page>
</template>
<script>
import PageHeader from "components/PageHeader.vue";
export default {
  name: "ContactForm",
  components: { PageHeader },
  data() {
    return {
      name: "",
      email: "",
      message: "",
      sending: false,
    };
  },
  methods: {
    async onSubmit() {
      this.sending = true;
      const resp = await this.$api.post(
        "/api/contact/",
        {
          name: this.name,
          email: this.email,
          message: this.message,
        },
        { headers: { "X-CSRFToken": this.$q.cookies.get("csrftoken") } }
      );
      this.name = "";
      this.email = "";
      this.message = "";
      this.sending = false;
      this.$q.notify({
        type: "positive",
        message: "Your message has been sent.",
      });
      this.$router.push("/");
    },
  },
};
</script>
