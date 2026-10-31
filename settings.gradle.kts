pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "Al-Muallim"
include(":app", ":core:model", ":core:common", ":feature:home", ":feature:quiz", ":feature:profile", ":feature:leaderboard", ":feature:settings")
