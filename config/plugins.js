module.exports = ({ env }) => ({

  // ...
  upload: {
    // `strapi develop` without AWS credentials stores uploads in public/uploads,
    // so media can be tested locally. Any other environment always uses S3.
    config: !env('AWS_BUCKET') && env('NODE_ENV') === 'development' ? { provider: 'local' } : {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: env('CDN_URL'),
        s3Options: {
          credentials: {
            accessKeyId: env('accessKeyId'),
            secretAccessKey: env('secretAccessKey'),
          },
          region: env('AWS_REGION'),
          params: {
            Bucket: env('AWS_BUCKET'),
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  seo: {
    enabled: true,
  },
  'drag-drop-content-types': {
    enabled: true
  },
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: env('DEFAULT_FROM'),
        defaultReplyTo: env('DEFAULT_ReplyTo'),
      },
    }
  },

  'blog-tools': {
    enabled: true,
    resolve: './src/plugins/blog-tools',
  },

  ezforms: {
    enabled: true,
    resolve: './src/plugins/ezforms',
    config: {
      enabled: true,
      captchaProvider: {
        name: 'none',
      },
      notificationProviders: [
        {
          name: 'email',
          enabled: true,
          config: {
            subject: "Contact From", // Optional
            from: 'hello@zusedigital.com' // Required
          }
        }
      ]
    }
  },
  tinymce: {
    enabled: true,
    config: {
      editor: {
        outputFormat: "html",
        editorConfig: {
          language: "EN", // Language code
          height: 500, // Height of the editor
          menubar: true, // Enable the menu bar
          extended_valid_elements: "*[*]", // Allow all elements and attributes
          valid_children: "+body[style], +div[script|style]", // Allow specific children in elements
          forced_root_block: "div", // Force block element
          convert_urls: false, // Disable URL conversion
          entity_encoding: "raw", // Output raw entities
          branding: false, // Remove "Powered by TinyMCE"
          content_css: ["https://cdnjs.cloudflare.com/ajax/libs/tiny-slider/2.9.4/tiny-slider.css"], // Custom stylesheets
          ui_mode: "split", // Sticky toolbar needs split UI when the app scrolls a panel, not the window (Strapi admin).
          toolbar_sticky: true, // Sticky toolbar
          toolbar_sticky_offset: 64,
          plugins:
            "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table emoticons nonbreaking wordcount codesample hr directionality template save paste autoresize",
          toolbar:
            "undo redo | fontselect fontsizeselect formatselect | bold italic underline strikethrough forecolor backcolor removeformat | alignleft aligncenter alignright alignjustify | outdent indent | bullist numlist | link image media | codesample table hr emoticons | fullscreen preview print | help",
          style_formats: [
            {
              title: "Headings",
              items: [
                { title: "h1", block: "h1" },
                { title: "h2", block: "h2" },
                { title: "h3", block: "h3" },
                { title: "h4", block: "h4" },
                { title: "h5", block: "h5" },
                { title: "h6", block: "h6" },
              ],
            },
            {
              title: "Inline",
              items: [
                { title: "Bold", inline: "b" },
                { title: "Italic", inline: "i" },
                { title: "Underline", inline: "u" },
                { title: "Strikethrough", inline: "strike" },
                { title: "Superscript", inline: "sup" },
                { title: "Subscript", inline: "sub" },
                { title: "Code", inline: "code" },
              ],
            },
            {
              title: "Blocks",
              items: [
                { title: "Paragraph", block: "p" },
                { title: "Blockquote", block: "blockquote" },
                { title: "Div", block: "div" },
                { title: "Pre", block: "pre" },
              ],
            },
            {
              title: "Alignment",
              items: [
                { title: "Left", block: "p", styles: { textAlign: "left" } },
                { title: "Center", block: "p", styles: { textAlign: "center" } },
                { title: "Right", block: "p", styles: { textAlign: "right" } },
                { title: "Justify", block: "p", styles: { textAlign: "justify" } },
              ],
            },
          ],
          fontsize_formats: "8pt 10pt 12pt 14pt 18pt 24pt 36pt", // Font size options
          font_formats: "Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; Times New Roman=times new roman,times,serif;",
          automatic_uploads: true, // Enable automatic uploads
          images_upload_url: "/upload",
          file_picker_types: "file image media", // Enable file picker
          file_picker_callback: function (callback, value, meta) {
            // Custom file picker logic
            if (meta.filetype === "image") {
              const input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute("accept", "image/*");
              input.onchange = function () {
                const file = this.files[0];
                const reader = new FileReader();
                reader.onload = function () {
                  callback(reader.result, { alt: file.name });
                };
                reader.readAsDataURL(file);
              };
              input.click();
            }
          },
          paste_data_images: true, // Enable pasting images
          browser_spellcheck: true, // Enable spell checking
          contextmenu: "link image inserttable | cell row column deletetable", // Custom context menu
          templates: [
            { title: "Default Template", content: "<p>This is a default template</p>" },
            { title: "Styled Template", content: "<div class='styled'>Content</div>" },
          ],
          autosave_ask_before_unload: true, // Autosave prompt on exit
          autosave_interval: "30s", // Autosave interval
          autosave_retention: "2m", // Autosave retention time
          importcss_append: true, // Append custom CSS to editor
          content_style: `
          body { font-family: Arial, sans-serif; }
          img { max-width: 723px !important; width: 100% !important; height: auto !important; }
        `,

          // ADD: Resize image before uploading to Strapi/S3
          images_upload_handler: function (blobInfo, success, failure) {
            const MAX_WIDTH = 723;
            const MAX_HEIGHT = 542;

            const img = new Image();
            const objectUrl = URL.createObjectURL(blobInfo.blob());

            img.onload = function () {
              let width = img.width;
              let height = img.height;

              // Only resize if image exceeds max dimensions
              if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
              }

              const canvas = document.createElement("canvas");
              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, width, height);
              URL.revokeObjectURL(objectUrl);

              canvas.toBlob(
                function (resizedBlob) {
                  const formData = new FormData();
                  formData.append("files", resizedBlob, blobInfo.filename());

                  fetch("/api/upload", {        // ← Strapi v4 upload endpoint
                    method: "POST",
                    body: formData,
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      // Strapi returns array; use CDN URL if available
                      const url = data[0]?.url;
                      if (url) {
                        success(url);
                      } else {
                        failure("Upload failed: no URL returned");
                      }
                    })
                    .catch(() => failure("Upload failed"));
                },
                blobInfo.blob().type   // preserve original mime type (jpeg/png/webp)
              );
            };

            img.onerror = function () {
              URL.revokeObjectURL(objectUrl);
              failure("Image load error");
            };

            img.src = objectUrl;
          },

          // ADD: Catch images inserted via file_picker_callback (base64 path)
          // and enforce width attribute on insert
          setup: function (editor) {
            editor.on("NodeChange", function (e) {
              if (e.element.nodeName === "IMG") {
                const MAX_WIDTH = 723;
                const img = e.element;

                if (img.naturalWidth > MAX_WIDTH) {
                  img.setAttribute("width", MAX_WIDTH);
                  img.removeAttribute("height");
                  img.style.maxWidth = MAX_WIDTH + "px";
                  img.style.height = "auto";
                }
              }
            });
          },
        },
      },

    },
  }

  // ...
});
