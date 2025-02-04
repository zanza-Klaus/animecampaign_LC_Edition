import Stat from "./Stat.js";
import Category from "./Category.js";

/** 
 * Data structure for characters. 
 */
export default class CharacterData extends foundry.abstract.DataModel {

    /** Defining the data structure of this data model. This cannot be changed post-init.
     * @returns {Object}
     */
    static defineSchema () {
        const fields = foundry.data.fields;

        const colorStats = {};
        for (const element of CONFIG.AC.colorKeys) {
            colorStats[element] = new fields.EmbeddedDataField(Stat, {
                initial: null,
                nullable: true
            });
        }

        return {
            stamina: new fields.EmbeddedDataField(Stat),
            proficiency: new fields.EmbeddedDataField(Stat),
            movement: new fields.EmbeddedDataField(Stat),

            _stats: new fields.SchemaField(colorStats), // remove underscores post v1.0

            categories: new fields.ArrayField(new fields.EmbeddedDataField(Category), {
                initial: CONFIG.AC.defaultCategories
            }),

            biography: new fields.SchemaField({
                editor: new fields.StringField({ initial: 'markdown' }),
                plaintext: new fields.StringField(),
                richtext: new fields.HTMLField(),
            }),

            class: new fields.StringField(),
            word: new fields.StringField(),
            type: new fields.StringField(),
            color: new fields.StringField({
                required: true,
                initial: CONFIG.AC.defaultColor
            }),

            // ! Pre-v1.0
            description: new fields.HTMLField(),
            stats: new fields.ArrayField(new fields.ObjectField()),
        };
    }

    /** Returns the class level as a roman numeral.
     * @returns {number} 
     */
    get classLevel () {
        const prof = this.proficiency.value;
        return (1 + Math.floor(prof / 100));
    }
}
