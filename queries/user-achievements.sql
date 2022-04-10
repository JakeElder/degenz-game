SELECT u.id, u.display_name, a.symbol FROM "user" AS "u"
JOIN user_achievements_achievement AS ua ON u.id = ua.user_id
JOIN achievement AS a ON ua.achievement_id = a.id;