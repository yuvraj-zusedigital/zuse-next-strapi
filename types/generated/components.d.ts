import type { Schema, Struct } from '@strapi/strapi';

export interface BannerBlockBlocks extends Struct.ComponentSchema {
  collectionName: 'components_banner_block_blocks';
  info: {
    displayName: 'Blocks';
    icon: 'apps';
  };
  attributes: {
    enable_section: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    image_jpg: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    image_webp: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    sub_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface CaseStudyImageBlock extends Struct.ComponentSchema {
  collectionName: 'components_case_study_image_blocks';
  info: {
    displayName: 'Image';
    icon: 'picture';
  };
  attributes: {
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface CaseStudyImagePair extends Struct.ComponentSchema {
  collectionName: 'components_case_study_image_pairs';
  info: {
    displayName: 'Image pair';
    icon: 'grid';
  };
  attributes: {
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    images: Schema.Attribute.Media<'images', true> & Schema.Attribute.Required;
  };
}

export interface CaseStudyMetaField extends Struct.ComponentSchema {
  collectionName: 'components_case_study_meta_fields';
  info: {
    displayName: 'Meta field';
    icon: 'bulletList';
  };
  attributes: {
    href: Schema.Attribute.String;
    hrefLabel: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.Text;
  };
}

export interface CaseStudyTextBlock extends Struct.ComponentSchema {
  collectionName: 'components_case_study_text_blocks';
  info: {
    displayName: 'Text block';
    icon: 'file';
  };
  attributes: {
    body: Schema.Attribute.Blocks;
    bulletColumns: Schema.Attribute.Enumeration<['one', 'two']> &
      Schema.Attribute.DefaultTo<'one'>;
    bullets: Schema.Attribute.Component<'elements.bullet', true>;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsBullet extends Struct.ComponentSchema {
  collectionName: 'components_elements_bullets';
  info: {
    displayName: 'Bullet';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface ElementsBulletGroup extends Struct.ComponentSchema {
  collectionName: 'components_elements_bullet_groups';
  info: {
    displayName: 'Bullet group';
    icon: 'apps';
  };
  attributes: {
    items: Schema.Attribute.Component<'elements.bullet', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_faq_items';
  info: {
    displayName: 'FAQ item';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsFormField extends Struct.ComponentSchema {
  collectionName: 'components_elements_form_fields';
  info: {
    description: "Label and placeholder of a form field that's always shown and required.";
    displayName: 'Form field';
    icon: 'pencil';
  };
  attributes: {
    label: Schema.Attribute.String;
    placeholder: Schema.Attribute.String;
  };
}

export interface ElementsIndustry extends Struct.ComponentSchema {
  collectionName: 'components_elements_industrys';
  info: {
    displayName: 'Industry';
    icon: 'briefcase';
  };
  attributes: {
    color: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::color-picker.color'>;
    copy: Schema.Attribute.Text;
    imageDesktop: Schema.Attribute.Media<'images'>;
    imageMobile: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_links';
  info: {
    description: 'A link to a page (preferred: follows the page if its path changes) or to any URL.';
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    href: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    page: Schema.Attribute.Relation<'oneToOne', 'api::page.page'>;
    variant: Schema.Attribute.Enumeration<['primary', 'secondary']> &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface ElementsLinkGroup extends Struct.ComponentSchema {
  collectionName: 'components_elements_link_groups';
  info: {
    displayName: 'Link group';
    icon: 'bulletList';
  };
  attributes: {
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    links: Schema.Attribute.Component<'elements.link', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsManifestoLine extends Struct.ComponentSchema {
  collectionName: 'components_elements_manifesto_lines';
  info: {
    displayName: 'Manifesto paragraph';
    icon: 'quote';
  };
  attributes: {
    inlineImage: Schema.Attribute.Media<'images'>;
    textAfter: Schema.Attribute.Text;
    textBefore: Schema.Attribute.Text;
  };
}

export interface ElementsMenuItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_menu_items';
  info: {
    description: "An item in the header's services dropdown: a link with a short description and a preview image.";
    displayName: 'Menu item';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Text;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    href: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    page: Schema.Attribute.Relation<'oneToOne', 'api::page.page'>;
  };
}

export interface ElementsOffering extends Struct.ComponentSchema {
  collectionName: 'components_elements_offerings';
  info: {
    displayName: 'Offering';
    icon: 'layer';
  };
  attributes: {
    description: Schema.Attribute.Text;
    points: Schema.Attribute.Component<'elements.bullet', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsOptionalFormField extends Struct.ComponentSchema {
  collectionName: 'components_elements_optional_form_fields';
  info: {
    description: 'A form field that can be made optional or hidden.';
    displayName: 'Optional form field';
    icon: 'pencil';
  };
  attributes: {
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String;
    placeholder: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface ElementsProcessStage extends Struct.ComponentSchema {
  collectionName: 'components_elements_process_stages';
  info: {
    displayName: 'Process stage';
    icon: 'arrowRight';
  };
  attributes: {
    body: Schema.Attribute.Text;
    shortTitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsProcessStep extends Struct.ComponentSchema {
  collectionName: 'components_elements_process_steps';
  info: {
    displayName: 'Process step';
    icon: 'arrowRight';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images'>;
    iconOverlay: Schema.Attribute.Media<'images'>;
    iconSize: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 400;
          min: 8;
        },
        number
      >;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    titleImage: Schema.Attribute.Media<'images'>;
  };
}

export interface ElementsQuoteCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_quote_cards';
  info: {
    displayName: 'Quote card';
    icon: 'quote';
  };
  attributes: {
    company: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    quote: Schema.Attribute.Text;
    role: Schema.Attribute.String;
  };
}

export interface ElementsServiceCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_service_cards';
  info: {
    displayName: 'Service card';
    icon: 'dashboard';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'>;
    description: Schema.Attribute.Text;
    diagram: Schema.Attribute.Enumeration<
      [
        'none',
        'ai-agents',
        'ai-product',
        'seo',
        'web-application',
        'mobile-app',
        'web-design',
      ]
    > &
      Schema.Attribute.DefaultTo<'none'>;
    href: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_social_links';
  info: {
    displayName: 'Social link';
    icon: 'earth';
  };
  attributes: {
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    href: Schema.Attribute.String & Schema.Attribute.Required;
    icon: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsWorkCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_work_cards';
  info: {
    displayName: 'Work card';
    icon: 'picture';
  };
  attributes: {
    description: Schema.Attribute.Text;
    href: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    size: Schema.Attribute.Enumeration<['small', 'large']> &
      Schema.Attribute.DefaultTo<'small'>;
    tags: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    video: Schema.Attribute.Media<'videos'>;
  };
}

export interface FromsubmissionsdataFromsubmissionsdata
  extends Struct.ComponentSchema {
  collectionName: 'components_fromsubmissionsdata_fromsubmissionsdata';
  info: {
    displayName: 'fromsubmissionsdata';
  };
  attributes: {
    Key: Schema.Attribute.String;
    Value: Schema.Attribute.String;
  };
}

export interface ImageImage extends Struct.ComponentSchema {
  collectionName: 'components_image_images';
  info: {
    description: '';
    displayName: 'Image';
    icon: 'landscape';
  };
  attributes: {
    JpgImage: Schema.Attribute.Media<'images'>;
  };
}

export interface ProjectContentProjectContent extends Struct.ComponentSchema {
  collectionName: 'components_project_content_project_contents';
  info: {
    description: '';
    displayName: 'ProjectContent';
    icon: 'bulletList';
  };
  attributes: {
    BannerColor: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::color-picker.color'>;
    BannerDescription: Schema.Attribute.Text;
    BannerTitle: Schema.Attribute.String;
    BelowBannerDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    BelowBannerTitle: Schema.Attribute.String & Schema.Attribute.Required;
    Image: Schema.Attribute.Component<'image.image', false>;
    RepetableMedia: Schema.Attribute.Component<
      'repetable-media.repetable-media',
      true
    >;
  };
}

export interface RepetableMediaRepetableMedia extends Struct.ComponentSchema {
  collectionName: 'components_repetable_media_repetable_medias';
  info: {
    description: '';
    displayName: 'RepetableMedia';
    icon: 'landscape';
  };
  attributes: {
    JpgImage: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    WebpImage: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface SectionsAuthorCard extends Struct.ComponentSchema {
  collectionName: 'components_sections_author_cards';
  info: {
    description: 'Profile card for an author (photo, role, bio), linking to their profile.';
    displayName: 'Author card';
    icon: 'user';
  };
  attributes: {
    author: Schema.Attribute.Relation<'oneToOne', 'api::author.author'>;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface SectionsAwardsList extends Struct.ComponentSchema {
  collectionName: 'components_sections_awards_lists';
  info: {
    displayName: 'Awards list';
    icon: 'medal';
  };
  attributes: {
    awards: Schema.Attribute.Relation<'oneToMany', 'api::award.award'>;
    detailed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    lead: Schema.Attribute.Text;
    title: Schema.Attribute.Text;
  };
}

export interface SectionsBadgeGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_badge_grids';
  info: {
    displayName: 'Badge grid';
    icon: 'medal';
  };
  attributes: {
    badges: Schema.Attribute.Media<'images', true> & Schema.Attribute.Required;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface SectionsBlogFeed extends Struct.ComponentSchema {
  collectionName: 'components_sections_blog_feeds';
  info: {
    displayName: 'Blog feed';
    icon: 'feather';
  };
  attributes: {
    featuredOnly: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    limit: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<6>;
    title: Schema.Attribute.Text;
  };
}

export interface SectionsBulletGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_bullet_grids';
  info: {
    displayName: 'Bullet grid';
    icon: 'bulletList';
  };
  attributes: {
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    items: Schema.Attribute.Component<'elements.bullet', true>;
    lead: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SectionsBulletGroups extends Struct.ComponentSchema {
  collectionName: 'components_sections_bullet_groups';
  info: {
    displayName: 'Bullet groups';
    icon: 'apps';
  };
  attributes: {
    groups: Schema.Attribute.Component<'elements.bullet-group', true>;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsCallout extends Struct.ComponentSchema {
  collectionName: 'components_sections_callouts';
  info: {
    description: 'Highlighted text block with a heading (e.g. "Our Commitment to Excellence").';
    displayName: 'Callout';
    icon: 'quote';
  };
  attributes: {
    body: Schema.Attribute.Blocks;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsCaseStudyCards extends Struct.ComponentSchema {
  collectionName: 'components_sections_case_study_cards';
  info: {
    displayName: 'Case study cards';
    icon: 'picture';
  };
  attributes: {
    cards: Schema.Attribute.Component<'elements.work-card', true>;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsContactForm extends Struct.ComponentSchema {
  collectionName: 'components_sections_contact_forms';
  info: {
    displayName: 'Contact form';
    icon: 'envelop';
  };
  attributes: {
    budgetField: Schema.Attribute.Component<
      'elements.optional-form-field',
      false
    >;
    budgetOptions: Schema.Attribute.Text;
    consentChecked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    consentText: Schema.Attribute.Text;
    description: Schema.Attribute.Text;
    emailField: Schema.Attribute.Component<'elements.form-field', false>;
    errorMessage: Schema.Attribute.Text;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    messageField: Schema.Attribute.Component<'elements.form-field', false>;
    nameField: Schema.Attribute.Component<'elements.form-field', false>;
    phoneField: Schema.Attribute.Component<
      'elements.optional-form-field',
      false
    >;
    referralField: Schema.Attribute.Component<
      'elements.optional-form-field',
      false
    >;
    referralOptions: Schema.Attribute.Text;
    serviceField: Schema.Attribute.Component<
      'elements.optional-form-field',
      false
    >;
    serviceOptions: Schema.Attribute.Text;
    submitLabel: Schema.Attribute.String;
    successPath: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'/thank-you'>;
    thankYouText: Schema.Attribute.Text;
    thankYouTitle: Schema.Attribute.Text;
    title: Schema.Attribute.Text;
  };
}

export interface SectionsFaq extends Struct.ComponentSchema {
  collectionName: 'components_sections_faqs';
  info: {
    displayName: 'FAQ';
    icon: 'question';
  };
  attributes: {
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    items: Schema.Attribute.Component<'elements.faq-item', true>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsFeaturedWork extends Struct.ComponentSchema {
  collectionName: 'components_sections_featured_works';
  info: {
    displayName: 'Featured work';
    icon: 'picture';
  };
  attributes: {
    cards: Schema.Attribute.Component<'elements.work-card', true>;
    cta: Schema.Attribute.Component<'elements.link', false>;
    description: Schema.Attribute.Text;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    title: Schema.Attribute.Text;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heros';
  info: {
    displayName: 'Hero';
    icon: 'star';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'>;
    description: Schema.Attribute.Text;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String;
    labelIcon: Schema.Attribute.Media<'images'>;
    primaryCta: Schema.Attribute.Component<'elements.link', false>;
    secondaryCta: Schema.Attribute.Component<'elements.link', false>;
    title: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SectionsIndustries extends Struct.ComponentSchema {
  collectionName: 'components_sections_industries';
  info: {
    displayName: 'Industries';
    icon: 'briefcase';
  };
  attributes: {
    description: Schema.Attribute.Text;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    items: Schema.Attribute.Component<'elements.industry', true>;
    title: Schema.Attribute.Text;
  };
}

export interface SectionsLogoStrip extends Struct.ComponentSchema {
  collectionName: 'components_sections_logo_strips';
  info: {
    displayName: 'Logo strip';
    icon: 'grid';
  };
  attributes: {
    avatarImage: Schema.Attribute.Media<'images'>;
    headingAfter: Schema.Attribute.String;
    headingBefore: Schema.Attribute.String;
    headingHighlight: Schema.Attribute.String;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    logos: Schema.Attribute.Media<'images', true>;
  };
}

export interface SectionsManifesto extends Struct.ComponentSchema {
  collectionName: 'components_sections_manifestos';
  info: {
    displayName: 'Manifesto';
    icon: 'quote';
  };
  attributes: {
    cta: Schema.Attribute.Component<'elements.link', false>;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    paragraphs: Schema.Attribute.Component<'elements.manifesto-line', true>;
  };
}

export interface SectionsPageIntro extends Struct.ComponentSchema {
  collectionName: 'components_sections_page_intros';
  info: {
    displayName: 'Page intro';
    icon: 'layout';
  };
  attributes: {
    body: Schema.Attribute.Blocks;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String;
    lead: Schema.Attribute.Text;
    title: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SectionsPhotoStrip extends Struct.ComponentSchema {
  collectionName: 'components_sections_photo_strips';
  info: {
    displayName: 'Photo strip';
    icon: 'picture';
  };
  attributes: {
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    images: Schema.Attribute.Media<'images', true>;
  };
}

export interface SectionsProcessStages extends Struct.ComponentSchema {
  collectionName: 'components_sections_process_stages';
  info: {
    displayName: 'Process stages';
    icon: 'arrowRight';
  };
  attributes: {
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    stages: Schema.Attribute.Component<'elements.process-stage', true>;
    title: Schema.Attribute.Text;
  };
}

export interface SectionsProcessSteps extends Struct.ComponentSchema {
  collectionName: 'components_sections_process_steps';
  info: {
    displayName: 'Process steps';
    icon: 'arrowRight';
  };
  attributes: {
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    steps: Schema.Attribute.Component<'elements.process-step', true>;
    title: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Our Process'>;
  };
}

export interface SectionsProfile extends Struct.ComponentSchema {
  collectionName: 'components_sections_profiles';
  info: {
    displayName: 'Profile';
    icon: 'user';
  };
  attributes: {
    blocks: Schema.Attribute.Component<'elements.bullet', true>;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    image: Schema.Attribute.Media<'images'>;
    imageCaption: Schema.Attribute.String;
    lead: Schema.Attribute.Text;
    link: Schema.Attribute.Component<'elements.link', false>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    role: Schema.Attribute.String;
  };
}

export interface SectionsQuote extends Struct.ComponentSchema {
  collectionName: 'components_sections_quotes';
  info: {
    displayName: 'Quote';
    icon: 'quote';
  };
  attributes: {
    cite: Schema.Attribute.String;
    citeImage: Schema.Attribute.Media<'images'>;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    quote: Schema.Attribute.Text;
  };
}

export interface SectionsRichText extends Struct.ComponentSchema {
  collectionName: 'components_sections_rich_texts';
  info: {
    displayName: 'Rich text';
    icon: 'file';
  };
  attributes: {
    body: Schema.Attribute.Blocks & Schema.Attribute.Required;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface SectionsServiceOfferings extends Struct.ComponentSchema {
  collectionName: 'components_sections_service_offerings';
  info: {
    displayName: 'Service offerings';
    icon: 'layer';
  };
  attributes: {
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    items: Schema.Attribute.Component<'elements.offering', true>;
    title: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Our Services'>;
  };
}

export interface SectionsServicesGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_services_grids';
  info: {
    displayName: 'Services grid';
    icon: 'dashboard';
  };
  attributes: {
    cards: Schema.Attribute.Component<'elements.service-card', true>;
    description: Schema.Attribute.Text;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    title: Schema.Attribute.Text;
  };
}

export interface SectionsSubscribeForm extends Struct.ComponentSchema {
  collectionName: 'components_sections_subscribe_forms';
  info: {
    description: 'Newsletter sign-up (name and email); sign-ups appear under Leads \u2192 Subscribers.';
    displayName: 'Subscribe box';
    icon: 'envelop';
  };
  attributes: {
    buttonLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    emailPlaceholder: Schema.Attribute.String;
    errorMessage: Schema.Attribute.Text;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    namePlaceholder: Schema.Attribute.String;
    requireFullName: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    successText: Schema.Attribute.Text;
    successTitle: Schema.Attribute.String;
    title: Schema.Attribute.Text;
  };
}

export interface SectionsTestimonialSlider extends Struct.ComponentSchema {
  collectionName: 'components_sections_testimonial_sliders';
  info: {
    displayName: 'Testimonial slider';
    icon: 'quote';
  };
  attributes: {
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    items: Schema.Attribute.Component<'elements.quote-card', true>;
  };
}

export interface SectionsTestimonials extends Struct.ComponentSchema {
  collectionName: 'components_sections_testimonials';
  info: {
    displayName: 'Testimonials';
    icon: 'discuss';
  };
  attributes: {
    description: Schema.Attribute.Text;
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    layout: Schema.Attribute.Enumeration<['carousel', 'grid']> &
      Schema.Attribute.DefaultTo<'carousel'>;
    testimonials: Schema.Attribute.Relation<
      'oneToMany',
      'api::testimonial.testimonial'
    >;
    title: Schema.Attribute.Text;
  };
}

export interface SectionsWorkGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_work_grids';
  info: {
    displayName: 'Work grid';
    icon: 'grid';
  };
  attributes: {
    hidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    showFilter: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.Text;
  };
}

export interface ServiceBannerBannerSection extends Struct.ComponentSchema {
  collectionName: 'components_service_banner_banner_sections';
  info: {
    displayName: 'Banner section';
    icon: 'grid';
  };
  attributes: {
    block: Schema.Attribute.Component<'banner-block.blocks', true>;
    description: Schema.Attribute.Text;
    enable_section: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String;
  };
}

export interface ServiceBlockServiceBlock extends Struct.ComponentSchema {
  collectionName: 'components_service_block_service_blocks';
  info: {
    displayName: 'service_block';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    line: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    title: Schema.Attribute.String;
  };
}

export interface ServiceSectionServiceSection extends Struct.ComponentSchema {
  collectionName: 'components_service_section_service_sections';
  info: {
    displayName: 'service_section';
    icon: 'database';
  };
  attributes: {
    enable_section: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    service_block: Schema.Attribute.Component<
      'service-block.service-block',
      true
    >;
  };
}

export interface SharedMetaSocial extends Struct.ComponentSchema {
  collectionName: 'components_shared_meta_socials';
  info: {
    displayName: 'metaSocial';
  };
  attributes: {
    description: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 65;
      }>;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    socialNetwork: Schema.Attribute.Enumeration<['Facebook', 'Twitter']> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'seo';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    focusKeyword: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
        minLength: 50;
      }>;
    metaImage: Schema.Attribute.Media<'images' | 'files' | 'videos'> &
      Schema.Attribute.Required;
    metaRobots: Schema.Attribute.String;
    metaSocial: Schema.Attribute.Component<'shared.meta-social', true>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaViewport: Schema.Attribute.String;
    structuredData: Schema.Attribute.JSON;
    structuredDataText: Schema.Attribute.Text;
  };
}

export interface SliderSlider extends Struct.ComponentSchema {
  collectionName: 'components_slider_sliders';
  info: {
    description: '';
    displayName: 'Slider';
  };
  attributes: {
    select_media: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    Videomp4: Schema.Attribute.Media<'videos'>;
  };
}

export interface UlBlockUlBlock extends Struct.ComponentSchema {
  collectionName: 'components_ul_block_ul_blocks';
  info: {
    displayName: 'ul_block';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Blocks;
    enable_section: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String;
  };
}

export interface WindowsImagesWindowsImages extends Struct.ComponentSchema {
  collectionName: 'components_windows_images_windows_images';
  info: {
    description: '';
    displayName: 'Windows Images';
  };
  attributes: {
    browserType: Schema.Attribute.Enumeration<['Chrome', 'Firefox', 'Edge']>;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'banner-block.blocks': BannerBlockBlocks;
      'case-study.image-block': CaseStudyImageBlock;
      'case-study.image-pair': CaseStudyImagePair;
      'case-study.meta-field': CaseStudyMetaField;
      'case-study.text-block': CaseStudyTextBlock;
      'elements.bullet': ElementsBullet;
      'elements.bullet-group': ElementsBulletGroup;
      'elements.faq-item': ElementsFaqItem;
      'elements.form-field': ElementsFormField;
      'elements.industry': ElementsIndustry;
      'elements.link': ElementsLink;
      'elements.link-group': ElementsLinkGroup;
      'elements.manifesto-line': ElementsManifestoLine;
      'elements.menu-item': ElementsMenuItem;
      'elements.offering': ElementsOffering;
      'elements.optional-form-field': ElementsOptionalFormField;
      'elements.process-stage': ElementsProcessStage;
      'elements.process-step': ElementsProcessStep;
      'elements.quote-card': ElementsQuoteCard;
      'elements.service-card': ElementsServiceCard;
      'elements.social-link': ElementsSocialLink;
      'elements.work-card': ElementsWorkCard;
      'fromsubmissionsdata.fromsubmissionsdata': FromsubmissionsdataFromsubmissionsdata;
      'image.image': ImageImage;
      'project-content.project-content': ProjectContentProjectContent;
      'repetable-media.repetable-media': RepetableMediaRepetableMedia;
      'sections.author-card': SectionsAuthorCard;
      'sections.awards-list': SectionsAwardsList;
      'sections.badge-grid': SectionsBadgeGrid;
      'sections.blog-feed': SectionsBlogFeed;
      'sections.bullet-grid': SectionsBulletGrid;
      'sections.bullet-groups': SectionsBulletGroups;
      'sections.callout': SectionsCallout;
      'sections.case-study-cards': SectionsCaseStudyCards;
      'sections.contact-form': SectionsContactForm;
      'sections.faq': SectionsFaq;
      'sections.featured-work': SectionsFeaturedWork;
      'sections.hero': SectionsHero;
      'sections.industries': SectionsIndustries;
      'sections.logo-strip': SectionsLogoStrip;
      'sections.manifesto': SectionsManifesto;
      'sections.page-intro': SectionsPageIntro;
      'sections.photo-strip': SectionsPhotoStrip;
      'sections.process-stages': SectionsProcessStages;
      'sections.process-steps': SectionsProcessSteps;
      'sections.profile': SectionsProfile;
      'sections.quote': SectionsQuote;
      'sections.rich-text': SectionsRichText;
      'sections.service-offerings': SectionsServiceOfferings;
      'sections.services-grid': SectionsServicesGrid;
      'sections.subscribe-form': SectionsSubscribeForm;
      'sections.testimonial-slider': SectionsTestimonialSlider;
      'sections.testimonials': SectionsTestimonials;
      'sections.work-grid': SectionsWorkGrid;
      'service-banner.banner-section': ServiceBannerBannerSection;
      'service-block.service-block': ServiceBlockServiceBlock;
      'service-section.service-section': ServiceSectionServiceSection;
      'shared.meta-social': SharedMetaSocial;
      'shared.seo': SharedSeo;
      'slider.slider': SliderSlider;
      'ul-block.ul-block': UlBlockUlBlock;
      'windows-images.windows-images': WindowsImagesWindowsImages;
    }
  }
}
