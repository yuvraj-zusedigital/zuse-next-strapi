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
      'fromsubmissionsdata.fromsubmissionsdata': FromsubmissionsdataFromsubmissionsdata;
      'image.image': ImageImage;
      'project-content.project-content': ProjectContentProjectContent;
      'repetable-media.repetable-media': RepetableMediaRepetableMedia;
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
