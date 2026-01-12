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
    baldrs_invulnerability: { id: 'baldrs_invulnerability', name: "Baldr's Invulnerability", priority: 5, levels: [{ cost: 3, effectValue: 1, description: "" }, { cost: 6, effectValue: 2, description: "" }, { cost: 9, effectValue: 3, description: "" }] },
    skadis_hunt: { id: 'skadis_hunt', name: "Skadi's Hunt", priority: 6, levels: [{ cost: 6, effectValue: 1, description: "" }, { cost: 10, effectValue: 2, description: "" }, { cost: 14, effectValue: 3, description: "" }] },
    freyrs_plenty: { id: 'freyrs_plenty', name: "Freyr's Plenty", priority: 3, levels: [{ cost: 4, effectValue: 2, description: "" }, { cost: 6, effectValue: 3, description: "" }, { cost: 8, effectValue: 4, description: "" }] },
    skulds_claim: { id: 'skulds_claim', name: "Skuld's Claim", priority: 2, levels: [{ cost: 4, effectValue: 2, description: "" }, { cost: 6, effectValue: 3, description: "" }, { cost: 8, effectValue: 4, description: "" }] },
    ullrs_aim: { id: 'ullrs_aim', name: "Ullr's Aim", priority: 4, levels: [{ cost: 2, effectValue: 2, description: "" }, { cost: 3, effectValue: 3, description: "" }, { cost: 4, effectValue: 6, description: "" }] },
    heimdalls_watch: { id: 'heimdalls_watch', name: "Heimdall's Watch", priority: 7, levels: [{ cost: 4, effectValue: 1, description: "" }, { cost: 7, effectValue: 2, description: "" }, { cost: 10, effectValue: 3, description: "" }] },
    friggs_sight: { id: 'friggs_sight', name: "Frigg's Sight", priority: 1, levels: [{ cost: 2, effectValue: 2, description: "" }, { cost: 3, effectValue: 3, description: "" }, { cost: 4, effectValue: 4, description: "" }] },
    bragis_verve: { id: 'bragis_verve', name: "Bragi's Verve", priority: 9, levels: [{ cost: 4, effectValue: 2, description: "" }, { cost: 8, effectValue: 3, description: "" }, { cost: 12, effectValue: 4, description: "" }] },
    mimirs_wisdom: { id: 'mimirs_wisdom', name: "Mimir's Wisdom", priority: 8, levels: [{ cost: 3, effectValue: 1, description: "" }, { cost: 5, effectValue: 2, description: "" }, { cost: 7, effectValue: 3, description: "" }] },
    hels_grip: { id: 'hels_grip', name: "Hel's Grip", priority: 6, levels: [{ cost: 6, effectValue: 1, description: "" }, { cost: 12, effectValue: 2, description: "" }, { cost: 18, effectValue: 3, description: "" }] },
    freyjas_plenty: { id: 'freyjas_plenty', name: "Freyja's Plenty", priority: 1, levels: [{ cost: 2, effectValue: 1, description: "" }, { cost: 4, effectValue: 2, description: "" }, { cost: 6, effectValue: 3, description: "" }] },
    // Remaining Gods...
    lokis_trick: { id: 'lokis_trick', name: "Loki's Trick", priority: 0, levels: [{ cost: 3, effectValue: 1, description: "" }, { cost: 6, effectValue: 2, description: "" }, { cost: 9, effectValue: 3, description: "" }] },
    thrymrs_theft: { id: 'thrymrs_theft', name: "Thrymr's Theft", priority: 5, levels: [{ cost: 3, effectValue: 1, description: "" }, { cost: 6, effectValue: 2, description: "" }, { cost: 9, effectValue: 3, description: "" }] },
    vars_bond: { id: 'vars_bond', name: "Var's Bond", priority: 8, levels: [{ cost: 10, effectValue: 1, description: "" }, { cost: 14, effectValue: 2, description: "" }, { cost: 18, effectValue: 3, description: "" }] },
    brunhilds_fury: { id: 'brunhilds_fury', name: "Brunhild's Fury", priority: 7, levels: [{ cost: 6, effectValue: 1.5, description: "" }, { cost: 10, effectValue: 2, description: "" }, { cost: 18, effectValue: 3, description: "" }] },
    tyrs_pledge: { id: 'tyrs_pledge', name: "Tyr's Pledge", priority: 2, levels: [{ cost: 4, effectValue: 2, description: "" }, { cost: 6, effectValue: 3, description: "" }, { cost: 8, effectValue: 4, description: "" }] },
    odins_sacrifice: { id: 'odins_sacrifice', name: "Odin's Sacrifice", priority: 9, levels: [{ cost: 6, effectValue: 3, description: "" }, { cost: 8, effectValue: 4, description: "" }, { cost: 10, effectValue: 5, description: "" }] },
};
