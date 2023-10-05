import lang from "../lang/en.json" assert { type: 'json' };
import * as AC from "./AC.js";

// An object containing language localization paths and default configurations.
export const animecampaign = AC.facadeObject(lang).animecampaign;

animecampaign.colors = ['red', 'blue', 'yellow', 'green', 'orange', 'cyan', 'purple', 'grey'];
animecampaign.defaultColor = "#CCCCCC";

animecampaign.defaultCategories = {
    'weapon': ['damage', 'range'],
    'talent': ['bonus'],
    'passive': [],
    'ability': ['cost'],
};

animecampaign.createCategoryDialogContent = `
    <form autocomplete="off">
        <div class="form-group">
            <label>Name</label>
            <div class="form-fields">
                <input type="text" name="name" placeholder="New Category" autofocus>
            </div>
        </div>
    </form>
`;
