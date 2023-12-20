import * as List from "../List.js";

/**
 * Extending the Actor class for system-specific logic.
 */
export default class ACActor extends Actor {

    /** Fires before a document is created. For preliminary operations.
     * @param {*} data 
     * @param {*} options 
     * @param {BaseUser} user 
     */
    _preCreate(data, options, user) {
        super._preCreate(data, options, user);

        const defaultTextEditor = game.settings.get('animecampaign', 'defaultTextEditor');
        this.updateSource({ 'system.biography.editor': defaultTextEditor });
    }

    /** Fired whenever an embedded document is created.
     * @param {Document} parent
     * @param {String} collection
     * @param {Document[]} documents 
     * @param {...*} args 
     */
    _onCreateDescendantDocuments (parent, collection, documents, ...args) {
        if (collection == 'items') {
            
            // if the category of the items don't exist in the owner, create it
            const features = documents.filter(document => document.type == 'Feature');
            let categories = this.system.categories;

            features.forEach(feature => {
                const name = feature.system.category;
                const categoryExists = List.has(categories, { name })

                if (!categoryExists) {
                    categories = List.add(categories, { name })
                }
            })
            
            this.update({ 'system.categories': categories });
        }

        super._onCreateDescendantDocuments(parent, collection, documents, ...args);
    }

    //Overloads the base modifyTokenAttribute function so remove bar clamping. 
    /** Fires upon modifying a token attribute of an actor through the actor HUD.
     * @param {string} attribute
     * @param {number} value
     * @param {boolean} isDelta 
     * @param {boolean} isBar 
     */
    async modifyTokenAttribute(attribute, value, isDelta=false, isBar=true) {
        const current = foundry.utils.getProperty(this.system, attribute);
    
        // Determine the updates to make to the actor data
        let updates;
        if ( isBar ) {
            if (isDelta) value = Number(current.value) + value; // YOU
            updates = {[`system.${attribute}.value`]: value};
        } else {
            if ( isDelta ) value = Number(current) + value;
            updates = {[`system.${attribute}`]: value};
        }
        const allowed = Hooks.call("modifyTokenAttribute", {attribute, value, isDelta, isBar}, updates);
        return allowed !== false ? this.update(updates) : this;
      }
}
