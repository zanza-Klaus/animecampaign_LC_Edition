import * as Utils from "../Utils.js";
import * as List from "../List.js";

/**
 * A mixin for shared methods between Characters and Feature sheets.
 */
export const SheetMixin = {

    /** Global event listeners.
     * @param {*} html 
     * @param {*} sheet 
     */
    globalListeners (html, sheet) {

        /** Submits the form whenever the enter key is pressed.
         */
        void function submitOnEnter () {
            const enter = html.find('[data-enter]');

            enter.each((index, element) => {
                $(element).on('keypress', event => {
                    const escape = $(element).data('enter')

                    if (event.code == 'Enter') {
                        if (escape == 'shift' && event.shiftKey) return;

                        event.preventDefault();
                        sheet.submit();
                    }
                });
            });
        }()

        /** Fuck those red dotted lines.
         */
        void function disableSpellcheck () {
            html.ready(() => {
                html.find("input[type='text'], textarea").attr('spellcheck',false);
            });
        }()

        /** Resizes the height of a textarea dynamically as you type more.
         */
        void function resizeTextArea () {
            const resize = html.find('textarea[data-resize]');
            const scroll = html.find('[data-scrollable]');

            resize.each(function() {
                this.setAttribute("style", `height:${this.scrollHeight}px;`);
            });

            resize.on("input", function() {
                const initScrollY = scroll.scrollTop();

                this.style.height = 0;
                this.style.height = this.scrollHeight + "px";

                scroll.scrollTop(initScrollY);
            });
        }()

        /** Matches the color of each element with the document's color.
         */
        void function match () {
            const match = html.find('[data-match]');

            match.each((index, element) => {
                const properties = $(element).data('match') || "color";

                const obj = Utils.uniformObject(properties.split(' '), sheet.object.system.color);
                $(element).css(obj);
            })
        }()
        
        /** Contrasts the color of each element against the document's color luminosity.
         */
        void function contrast () {
            const contrast = html.find('[data-contrast]');

            contrast.each((index, element) => {
                const properties = $(element).data('contrast') || "color";

                const rgb = Utils.hexToRGB(sheet.object.system.color);
                rgb[0] *= 0.2126;
                rgb[1] *= 0.7152;
                rgb[2] *= 0.0722;

                const luma = rgb.reduce((n, m) => n + m) / 255;
                const color = (luma <= .5) ? "white" : "black";

                const obj = Utils.uniformObject(properties.split(' '), color);
                $(element).css(obj);
            })
        }()

        /** Contrasts the inputed color for an image, using filters.
         */
        void function contrastImage () {
            const WHITE = 'brightness(0) saturate(100%) invert(100%)';
            const BLACK = 'brightness(0) saturate(100%)';

            const contrast = html.find('img[data-contrast-image]');

            contrast.each((index, element) => {
                const hexcode = $(element).data('contrast-image') || "#CCCCCC";

                const rgb = Utils.hexToRGB(hexcode);
                rgb[0] *= 0.2126;
                rgb[1] *= 0.7152;
                rgb[2] *= 0.0722;

                const luma = rgb.reduce((n, m) => n + m) / 255;
                const filter = (luma <= .5) ? WHITE : BLACK;

                $(element).css('filter', filter);
            })
        }()

        /** Collapse a div.
         * @param {String} key The key of the data-collapse-target.
         * @param {Boolean?} short -s Should the visibility of this div be saved? Non-owners default to this.
         * @param {Boolean?} hide -h Should the div be hidden by default?
         * @param {Boolean?} data -a Should the visibility of this div be saved in a DataModel?
         */
        void function collapse () {
            const collapse = html.find('a[data-collapse]');

            const args = str => {
                const arr = str.split(' -');
                return {
                    key: arr[0],
                    // If the user isn't an owner, fallback to short.
                    short: arr.includes('s') || !sheet.isEditable,
                    hide: arr.includes('h'),
                    data: arr.includes('d'),
                }
            }

            // Setting values whenever the sheet updates.
            collapse.each((index, element) => {
                const { key, short, hide, data } = args($(element).data('collapse'))
                const target = html.find(`[data-collapse-target="${key}"]`);
                const chevron = $(element).find('i.fas');

                // If it's short, we only need to worry about if its hidden by default.
                if (short && hide) {
                    target.hide();
                    chevron.removeClass('fa-chevron-down');
                    chevron.addClass('fa-chevron-right');
                    return;
                } 
                
                const { collapsed } = ((data)
                    ? getProperty(sheet.object.system, key)
                    : sheet.object.getFlag('animecampaign_lc_edition', key)) 
                    ?? { collapsed: hide }

                if (!collapsed) {
                    target.show();
                    chevron.addClass('fa-chevron-down');
                    chevron.removeClass('fa-chevron-right');
                } else {
                    target.hide(); 
                    chevron.removeClass('fa-chevron-down');
                    chevron.addClass('fa-chevron-right');
                }
            })

            collapse.on('click', event => {
                const anchor = $(event.target).closest('[data-collapse]');
                const { key, short, hide, data } = args(anchor.data('collapse'))
                const target = html.find(`[data-collapse-target="${key}"]`);
                const chevron = anchor.find('i.fas')

                if (short) {
                    target.toggle();
                    chevron.toggleClass('fa-chevron-down');
                    chevron.toggleClass('fa-chevron-right');
                    return;
                }

                const { collapsed } = ((data)
                    ? getProperty(sheet.object.system, key)
                    : sheet.object.getFlag('animecampaign_lc_edition', key)) 
                    ?? { collapsed: hide }
                let update = { collapsed: !collapsed };

                if (data) {
                    const isListEntry = (typeof Number(key.at(-1)) == 'number');
                    if (isListEntry) {
                        const dot = key.indexOf('.');
                        const listName = key.slice(0, dot);
                        const list = getProperty(sheet.object.system, listName);
                        const index = Number(key.slice(dot + 1));
                        update = List.set(list, index, update);

                        return sheet.object.update({ [`system.${listName}`]: update });
                    }
                    return sheet.object.update({ [`system.${key}`]: update });
                }
                return sheet.object.setFlag('animecampaign_lc_edition', key, update)
            })
        }()

        /** Hides and reveals the textarea and div for the name.
         */
        void function facadeName () {
            const input = html.find('textarea[data-name]');
            const facade = html.find('[data-facade]');

            input.on("focus", () => {
                input.css('opacity', '1')
                facade.css('opacity', '0')
            })
            input.on("blur", () => {
                input.css('opacity', '0')
                facade.css('opacity', '1')
            })
        }()

        /** Resizes the font of the name such that any length fits cleanly.
         */
        void function resizeName () {
            const SCALE_DELTA = .05;
            const PX_PER_REM = 16;

            const name = html.find("[data-name]");

            const initialRem = parseInt(name.css('font-size')) / PX_PER_REM;
            const maxPxHeight = parseInt(name.css('height'));

            const scale = () => {
                name.css('font-size', `${initialRem}rem`)
        
                for (let i = 1; i > 0; i -= SCALE_DELTA) {
                    name.css('font-size', `${initialRem * i}rem`)

                    if (name[0].scrollHeight <= maxPxHeight) break;
                }
            }

            const resizeObserver = new ResizeObserver(scale);

            resizeObserver.observe(name[0]);
            resizeObserver.observe(html[0]);

            html.ready(scale);
            name.on('input', scale);
            name.on('blur', () => sheet.submit());
        }()

        /** Sets a feature's category via the selection.
         */
        void function selectCategory () {
            const select = html.find('[data-select-category="select"]');
            const target = html.find('[data-select-category="target"]');

            select.on('change', event => {
                const category = $(event.target).val();
                target.val(category);
                sheet.object.update();
            });
        }()

        /** Sets the name of the selected tab.
         */
        void function setTabName () {
            const nav = html.find('[data-nav]');
            const name = html.find('[data-tab-name]');

            const set = () => {
                const data = nav.find('.active').data('tab');
                const active = data.at(0).toUpperCase() + data.slice(1);

                name.text(game.i18n.localize(`AC.NAV.${active}`));
            }

            set();
            nav.on('click', set);
        }()

    },

}
