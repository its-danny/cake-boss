/* global $, Vue, axios, io */
/* eslint-disable no-new */

new Vue({
  el: '#live-wrap',

  data() {
    return {
      servers: 0,
      users: 0,
    };
  },

  mounted() {
    const socket = io('https://rabitrup.com');

    socket.on('live', response => {
      this.servers = response.servers;
      this.users = response.users;

      this.$el.querySelector('#live').classList = '';
    });
  },
});

new Vue({
  el: '#leaderboard-wrap',

  data() {
    return {
      topUsers: [],
      topServers: [],
    };
  },

  mounted() {
    axios
      .get('https://rabitrup.com/leaderboard')
      .then(response => {
        this.topUsers = response.data.topUsers;
        this.topServers = response.data.topServers;

        this.$el.querySelector('#leaderboard').classList = '';
      })
      .catch(() => {});
  },
});

new Vue({
  el: '#status-wrap',

  data() {
    return {
      isOnline: false,
    };
  },

  mounted() {
    axios
      .get('https://rabitrup.com/ping')
      .then(() => {
        this.isOnline = true;
      })
      .catch(() => {})
      .finally(() => {
        $('[data-toggle="tooltip"]').tooltip();
      });
  },
});
