export default {
  methods: {
    async onPlayMusic(item) {
      /*
        全部参数必传
        {
          @name: 歌曲名称
          @id: 歌曲 id
          @lrc: 歌词
          @image: 图片
          @singer: 歌手
          @url: 播放地址
        }
      */
      const obj = {};
      obj.name = item.name;
      obj.id = item.id;
      this.$store.commit('setOverlay', true);
      let check;
      try {
        check = await this.$axios.get('/check/music', {
          params: {
            id: item.id,
          },
        });
      } catch (error) {
        this.$toast('无版权');
      }
      if (check) {
        const url = await this.$axios.get('/song/url', {
          params: {
            id: item.id,
          },
        });
        const lyrics = await this.$axios.get('/lyric', {
          params: {
            id: item.id,
          },
        });
        let lyric = '';
        if (lyrics.data.nolyric) {
          lyric = '[00:00.000] 暂无歌词';
        } else {
          lyric = lyrics.data.lrc.lyric;
        }
        obj.lrc = this.formatLyrics(lyric);
        const detail = await this.$axios.get('/song/detail', {
          params: {
            ids: item.id,
          },
        });
        obj.image = detail.data.songs[0].al.picUrl;
        obj.singer = detail.data.songs[0].ar[0].name;
        obj.url = url.data.data[0].url;
        if (url.data.code === 200) {
          this.$store.commit('pushSong', obj);
          this.$store.commit('setCurrentSong', obj);
          this.$store.commit('setShowPlay', true);
          this.$store.commit('playMusic');
        }
      }
      this.$store.commit('setOverlay', false);
    },
    // 格式化歌词
    formatLyrics(lyrics) {
      const lrcList = lyrics.split('\n');
      const lrc = [];
      lrcList.forEach((lrcItem) => {
        const oneLrc = lrcItem.split(']');
        if (oneLrc[1]) {
          const time = oneLrc[0].replace('[', '');
          const timeSplit = time.split(':');
          const second = Number(timeSplit[1]);
          const minute = Number(timeSplit[0]);
          const allSecond = second + (minute * 60);
          const str = oneLrc[1];
          lrc.push({
            time: allSecond,
            lyrics: str,
          });
        }
      });
      return lrc;
    },
  },
};
