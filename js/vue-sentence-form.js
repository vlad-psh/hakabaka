Vue.component('vue-sentence-form', {
  data() {
    return {
      rawSentence: '',
      jpSentence: null,
      enSentence: null,
      newSentence: []
    }
  },
  methods: {
    processRawSentence() {
      this.jpSentence = this.rawSentence.split("\n\n")[0];
      this.enSentence = this.rawSentence.split("\n\n")[1];

      $.ajax({
        url: "/mecab",
        method: 'POST',
        data: {sentence: this.jpSentence}
      }).done(data => {
        this.newSentence = JSON.parse(data);
      });
    },
    newSentencePartSelected() {
      var textarea = document.querySelectorAll('.jpsentence')[0];
      var start = textarea.selectionStart;
      var finish = textarea.selectionEnd;
      if (start === finish) return;

      $.ajax({
        url: "/mecab",
        method: 'POST',
        data: {sentence: textarea.value.substring(start, finish)}
      }).done(data => {
        var jdata = JSON.parse(data);
        var result = [];
        var i = 0;
        for (substr of this.newSentence) {
            if (i <= start && i + substr.text.length >= finish && substr.seq === undefined) {
                if (i !== start) result.push({text: substr.text.substring(0, start - i)});

                jdata[0].text = jdata.reduce((acc,v) => acc + v.text, '');
                jdata[0].reading = jdata.reduce((acc,v) => acc + (v.reading || v.text), '');
                result.push(jdata[0]);

                if (i + substr.text.length !== finish) result.push({text: substr.text.substring(finish - i, substr.text.length)});
            } else {
                result.push(substr);
            }
            i += substr.text.length;
        }
        textarea.selectionStart = textarea.selectionEnd = 0;
        this.newSentence = result;
      });
    },
    newSentenceResetPart(partIdx) {
      var result = [];
      var tmpString = '';
      delete this.newSentence[partIdx].seq; // also: reading, base, gloss

      for (part of this.newSentence) {
        if (part.seq === undefined) {
          tmpString += part.text;
        } else {
          if (tmpString !== '') {
            result.push({text: tmpString});
            tmpString = '';
          }
          result.push(part);
        }
      }

      if (tmpString !== '') {
        result.push({text: tmpString});
        tmpString = '';
      }

      this.newSentence = result;
    },
    clearProcessedSentence() {
      this.jpSentence = null;
      this.enSentence = null;
    },
    saveProcessedSentence() {
      $.ajax({
        url: "/sentences",
        method: 'POST',
        data: {
          japanese: this.jpSentence,
          english: this.enSentence,
          structure: this.newSentence}
      }).done(data => {
        alert(data);
        //this.newSentence = JSON.parse(data);
        this.jpSentence = null;
        this.enSentence = null;
        this.newSentence = [];
      });
    }
  }, // end of methods
  template: `
<div class="vue-sentence-form-app">
  <div v-if="jpSentence === null">
    <textarea class="raw-sentence" v-model="rawSentence" style="max-width: 95%; width: 35em; height: 8em;"></textarea>
    <br>
    <input type="button" value="process" @click="processRawSentence">
  </div>
  <div v-else>
    &#x1f1ef;&#x1f1f5;
    <input class="jpsentence" type="text" @select="newSentencePartSelected" v-model="jpSentence" readonly="readonly">
    <br>
    &#x1f1ec;&#x1f1e7;
    <input class="ensentence" type="text" v-model="enSentence" readonly="readonly">

    <div class='new-sentence' @select="console.log('select')">
      <ruby v-for="(substr, sIdx) of newSentence" @click="newSentenceResetPart(sIdx)" :class='substr.seq ? "question-word" : ""'>
        <rb>{{substr.text}}</rb>
        <rt v-if="substr.reading">{{substr.reading}}</rt>
        <rtc v-if="substr.gloss">{{substr.gloss}}</rtc>
      </ruby>
    </div>

    <input type="button" value="cancel" @click="clearProcessedSentence">
    <input type="button" value="save" @click="saveProcessedSentence">
  </div>
</div>
`
});
