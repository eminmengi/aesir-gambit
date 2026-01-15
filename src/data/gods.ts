import type { GodFavor, GodFavorId } from "../types/game";

export const GODS: Record<GodFavorId, GodFavor> = {
    thors_strike: {
        id: 'thors_strike',
        name: "Thor's Strike",
        priority: 10,
        levels: [
            { cost: 4, effectValue: 2, description: "Deal 2 damage" },
            { cost: 8, effectValue: 5, description: "Deal 5 damage" },
            { cost: 12, effectValue: 8, description: "Deal 8 damage" }
        ]
    },
    iduns_rejuvenation: {
        id: 'iduns_rejuvenation',
        name: "Idun's Rejuvenation",
        priority: 8,
        levels: [
            { cost: 4, effectValue: 2, description: "Heal 2 health" },
            { cost: 7, effectValue: 4, description: "Heal 4 health" },
            { cost: 10, effectValue: 6, description: "Heal 6 health" }
        ]
    },
    vidars_might: {
        id: 'vidars_might',
        name: "Vidar's Might",
        priority: 4,
        levels: [
            { cost: 2, effectValue: 2, description: "Remove 2 enemy Helmets" },
            { cost: 4, effectValue: 4, description: "Remove 4 enemy Helmets" },
            { cost: 6, effectValue: 6, description: "Remove 6 enemy Helmets" }
        ]
    },
    // Placeholder for other 17 gods...
    baldrs_invulnerability: { id: 'baldrs_invulnerability', name: "Baldr's Invulnerability", priority: 5, levels: [{ cost: 3, effectValue: 1, description: "Add 1 Helmet/Shield per matching die" }, { cost: 6, effectValue: 2, description: "Add 2 Helmets/Shields per matching die" }, { cost: 9, effectValue: 3, description: "Add 3 Helmets/Shields per matching die" }] },
    skadis_hunt: { id: 'skadis_hunt', name: "Skadi's Hunt", priority: 6, levels: [{ cost: 6, effectValue: 1, description: "Add 1 Arrow per Arrow rolled" }, { cost: 10, effectValue: 2, description: "Add 2 Arrows per Arrow rolled" }, { cost: 14, effectValue: 3, description: "Add 3 Arrows per Arrow rolled" }] },
    freyrs_plenty: { id: 'freyrs_plenty', name: "Freyr's Gift", priority: 3, levels: [{ cost: 4, effectValue: 2, description: "Add 2 to majority face total" }, { cost: 6, effectValue: 3, description: "Add 3 to majority face total" }, { cost: 8, effectValue: 4, description: "Add 4 to majority face total" }] },
    skulds_claim: { id: 'skulds_claim', name: "Skuld's Claim", priority: 2, levels: [{ cost: 4, effectValue: 2, description: "Destroy 2 tokens per Arrow die" }, { cost: 6, effectValue: 3, description: "Destroy 3 tokens per Arrow die" }, { cost: 8, effectValue: 4, description: "Destroy 4 tokens per Arrow die" }] },
    ullrs_aim: { id: 'ullrs_aim', name: "Ullr's Aim", priority: 4, levels: [{ cost: 2, effectValue: 2, description: "2 Arrows ignore shields" }, { cost: 3, effectValue: 3, description: "3 Arrows ignore shields" }, { cost: 4, effectValue: 6, description: "6 Arrows ignore shields" }] },
    heimdalls_watch: { id: 'heimdalls_watch', name: "Heimdall's Watch", priority: 7, levels: [{ cost: 4, effectValue: 1, description: "Heal 1 per black" }, { cost: 7, effectValue: 2, description: "Heal 2 per block" }, { cost: 10, effectValue: 3, description: "Heal 3 per block" }] },
    friggs_sight: { id: 'friggs_sight', name: "Frigg's Sight", priority: 1, levels: [{ cost: 2, effectValue: 2, description: "Reroll 2 dice" }, { cost: 3, effectValue: 3, description: "Reroll 3 dice" }, { cost: 4, effectValue: 4, description: "Reroll 4 dice" }] },
    bragis_verve: { id: 'bragis_verve', name: "Bragi's Verve", priority: 9, levels: [{ cost: 4, effectValue: 2, description: "Gain 2 Tokens per Hand die" }, { cost: 8, effectValue: 3, description: "Gain 3 Tokens per Hand die" }, { cost: 12, effectValue: 4, description: "Gain 4 Tokens per Hand die" }] },
    mimirs_wisdom: { id: 'mimirs_wisdom', name: "Mimir's Wisdom", priority: 8, levels: [{ cost: 3, effectValue: 1, description: "Gain 1 Token per damage taken" }, { cost: 5, effectValue: 2, description: "Gain 2 Tokens per damage taken" }, { cost: 7, effectValue: 3, description: "Gain 3 Tokens per damage taken" }] },
    hels_grip: { id: 'hels_grip', name: "Hel's Grip", priority: 6, levels: [{ cost: 6, effectValue: 1, description: "Heal 1 Health per Axe damage dealt" }, { cost: 12, effectValue: 2, description: "Heal 2 Health per Axe damage dealt" }, { cost: 18, effectValue: 3, description: "Heal 3 Health per Axe damage dealt" }] },
    freyjas_plenty: { id: 'freyjas_plenty', name: "Freyja's Plenty", priority: 1, levels: [{ cost: 2, effectValue: 1, description: "Roll 1 extra die" }, { cost: 4, effectValue: 2, description: "Roll 2 extra dice" }, { cost: 6, effectValue: 3, description: "Roll 3 extra dice" }] },
    lokis_trick: { id: 'lokis_trick', name: "Loki's Trick", priority: 0, levels: [{ cost: 3, effectValue: 1, description: "Ban 1 die" }, { cost: 6, effectValue: 2, description: "Ban 2 dice" }, { cost: 9, effectValue: 3, description: "Ban 3 dice" }] },
    thrymrs_theft: { id: 'thrymrs_theft', name: "Thrymr's Theft", priority: 5, levels: [{ cost: 3, effectValue: 1, description: "-1 God Level" }, { cost: 6, effectValue: 2, description: "-2 God Levels" }, { cost: 9, effectValue: 3, description: "-3 God Levels" }] },
    vars_bond: { id: 'vars_bond', name: "Var's Bond", priority: 8, levels: [{ cost: 10, effectValue: 1, description: "Heal 1 per token spent by opponent" }, { cost: 14, effectValue: 2, description: "Heal 2 per token spent by opponent" }, { cost: 18, effectValue: 3, description: "Heal 3 per token spent by opponent" }] },
    brunhilds_fury: { id: 'brunhilds_fury', name: "Brunhild's Fury", priority: 7, levels: [{ cost: 6, effectValue: 1.5, description: "x1.5 Axe damage" }, { cost: 10, effectValue: 2, description: "x2 Axe damage" }, { cost: 18, effectValue: 3, description: "x3 Axe damage" }] },
    tyrs_pledge: { id: 'tyrs_pledge', name: "Tyr's Pledge", priority: 2, levels: [{ cost: 4, effectValue: 2, description: "-2 Tokens per Health sacrificed" }, { cost: 6, effectValue: 3, description: "-3 Tokens per Health sacrificed" }, { cost: 8, effectValue: 4, description: "-4 Tokens per Health sacrificed" }] },
    odins_sacrifice: { id: 'odins_sacrifice', name: "Odin's Sacrifice", priority: 9, levels: [{ cost: 6, effectValue: 3, description: "Gain 3 Token per Health sacrificed" }, { cost: 8, effectValue: 4, description: "Gain 4 Token per Health sacrificed" }, { cost: 10, effectValue: 5, description: "Gain 5 Token per Health sacrificed" }] },
};
