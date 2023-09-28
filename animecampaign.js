// AC FVTT
import * as AC from './module/AC.js'
import * as config from './module/config.js'

import CharacterData from './module/data-models/CharacterData.js';
import CharacterSheet from './module/sheets/CharacterSheet.js';

// Everything that runs on initialization.
Hooks.once('init', function () {
    AC.log('Initializing Anime Campaign System!');

    CONFIG.animecampaign = config.animecampaign;

    CONFIG.Actor.dataModels["Character"] = CharacterData;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("animecampaign", CharacterSheet, { makeDefault: true });

    AC.preloadHandlebarsTemplates();
})
