// Makes the editor's preview pane look like the real site.
CMS.registerPreviewStyle('/admin/preview.css');

// A "Lock from here" block for case studies. Everything after it is password protected on the site.
CMS.registerEditorComponent({
  id: 'lock',
  label: 'Lock from here',
  fields: [],
  pattern: /^<!-- lock -->$/,
  fromBlock: () => ({}),
  toBlock: () => '<!-- lock -->',
  toPreview: () => '<p class="lockline">Password protected from here down</p>',
});

const get = (entry, k) => entry.getIn(['data', k]) || '';

const StudyPreview = createClass({
  render() {
    const { entry, widgetFor } = this.props;
    const stats = entry.getIn(['data', 'stats']);
    return h('main', {},
      h('div', { className: 'lede' },
        h('h1', {}, get(entry, 'title')),
        h('dl', { className: 'facts' },
          ['company', 'role', 'timeline', 'team'].map(k =>
            h('div', { key: k }, h('dt', {}, k[0].toUpperCase() + k.slice(1)), h('dd', {}, get(entry, k)))))),
      stats && stats.size ? h('div', { className: 'stats' },
        stats.map((s, i) => h('div', { key: i }, h('b', {}, s.get('value')), h('span', {}, s.get('label'))))) : null,
      h('div', { className: 'story' }, widgetFor('body')));
  },
});
CMS.registerPreviewTemplate('studies', StudyPreview);

const AboutPreview = createClass({
  render() {
    const { entry, widgetFor, getAsset } = this.props;
    const photo = get(entry, 'photo');
    return h('main', {},
      photo ? h('img', { className: 'hero-photo', src: getAsset(photo).toString(), alt: '' }) : null,
      h('div', { className: 'story about' }, widgetFor('body')));
  },
});
CMS.registerPreviewTemplate('about', AboutPreview);

const TestimonialsPreview = createClass({
  render() {
    const items = this.props.entry.getIn(['data', 'items']);
    return h('main', {}, h('h1', { className: 'page-title' }, 'Testimonials'),
      h('div', { className: 'saids' }, (items || []).map((t, i) =>
        h('figure', { className: 'said', key: i },
          h('blockquote', {}, h('p', {}, t.get('quote'))),
          h('figcaption', {}, h('strong', {}, t.get('name')), t.get('title'), ' (shows on: ' + t.get('place') + ')')))));
  },
});
CMS.registerPreviewTemplate('testimonials', TestimonialsPreview);
