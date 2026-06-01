library(readxl)
library(janitor)
library(dplyr)
library(stringr)
library(tidyr)
library(writexl)
library(tibble)

df_delanteros = read_excel(path = "peru_percentiles.xlsx", col_types = "text") %>% 
  clean_names()

names(df_delanteros)

columnas_de_texto = c("jugador", "equipo", "liga", "posicion_1", "posicion_2", "posicion_3")

col_numericas = c("edad", "valor_de_mercado", "partidos_jugados")

min_minutos = round(max(as.numeric(df_delanteros$minutos_jugados), na.rm = T)*0.01, 0)

delanteros_filtro_min = df_delanteros

# Diccionario de equivalencias
posiciones_dict <- c(
  "LB"   = "Lateral Izquierdo",
  "CB"   = "Defensa Central",
  "CF"   = "Delantero",
  "RW"   = "Extremo Derecho",
  "LW"   = "Extremo Izquierdo",
  "LAMF" = "Mediocentro Ofensivo",
  "RCB"  = "Defensa Central",
  "RCMF" = "Mediocentro",
  "RWB"  = "Lateral Derecho",
  "RB"   = "Lateral Derecho",
  "RAMF" = "Mediocentro Ofensivo",
  "GK"   = "Arquero",
  "AMF"  = "Mediocentro Ofensivo",
  "LWB"  = "Lateral Izquierdo",
  "LWF"  = "Extremo Izquierdo",
  "LCMF" = "Mediocentro",
  "DMF"  = "Mediocentro",
  "RDMF" = "Mediocentro Defensivo",
  "LCB"  = "Defensa Central",
  "RWF"  = "Extremo Derecho",
  "LDMF" = "Mediocentro Defensivo",
  "NA"   = "Desconocido"   # Opcional
)

delanteros_metrics <- delanteros_filtro_min %>%
  mutate(across(
    .cols = starts_with("posicion_"),
    .fns  = ~ recode(.x, !!!posiciones_dict)
  ))

names(df_delanteros)

# metricas 
# names(df_delanteros)

# Suponiendo que df_delanteros es tu DataFrame
names(df_delanteros)
metrics <- delanteros_metrics %>% 
  select(ends_with("_90")) %>% 
  names()

delanteros_metrics <- delanteros_metrics %>%
  mutate(across(all_of(metrics), as.numeric)) %>%
  # Si existe, mantenemos liga como texto sin romper el flujo.
  mutate(across(any_of("liga"), as.character))

### AQUI IRIA EL DICCIONARIO

unique(delanteros_metrics$posicion_3)

columnas_de_texto = c("jugador", "equipo", "posicion_1", "posicion_2", "posicion_3")



# metricas 
# names(df_delanteros_metrics)

df_delanteros_p90 = delanteros_metrics %>% 
  select(any_of(columnas_de_texto), 
         any_of(col_numericas), 
         all_of(metrics))

# El archivo ya viene en percentiles: usamos esos valores directamente.
delanteros_percentile <- df_delanteros_p90

df_delanteros_p90 %>% 
  select(ends_with("_90")) %>% 
  summarise(across(everything(), class))

## Z-SCORE
delanteros_z_score <- df_delanteros_p90 %>% 
  group_by(posicion_1) %>% 
  mutate(across(ends_with("_90"),
                ~{
                  x <- suppressWarnings(as.numeric(.x))
                  (x - mean(x, na.rm = TRUE)) / sd(x, na.rm = TRUE)
                },
                .names = "{.col}_z_score")) %>% 
  ungroup() %>% 
  select(everything(), ends_with("_z_score"))

## Similitud
table(delanteros_percentile$posicion_1)

target = delanteros_percentile %>% filter(jugador == "A. Valera")
target$posicion_1

# consideramos volantes ofensivos tanto por derecha (RM) como por izquierad (LM)
pos = c("Delantero")


# 1) basado en percentiles
metrics_percentile = intersect(paste0(metrics, "_percentile"), names(delanteros_percentile))
if (length(metrics_percentile) == 0) {
  metrics_percentile = metrics
}

data_percentile = delanteros_percentile %>% 
  filter(posicion_1 %in% pos) %>%
  ungroup() %>% 
  select(jugador, all_of(metrics_percentile))

library(proxy)
sim_percentile = simil(x = data_percentile %>% select(-jugador), 
                       y = target %>% ungroup() %>% select(all_of(metrics_percentile)), 
                       method = "cosine")

## basado en z-score
metrics_z_score = paste0(metrics, "_z_score")
target = delanteros_z_score %>% filter(jugador == "A. Valera")

data_z_score = delanteros_z_score %>% 
  filter(posicion_1 %in% pos) %>%
  ungroup() %>% 
  select(jugador, metrics_z_score)

sim_z_score = simil(x = data_z_score %>% select(-jugador), 
                    y = target %>% ungroup() %>% select(metrics_z_score), 
                    method = "cosine")

## RESULTADOS

output_percentile = data_percentile %>% 
  mutate(sim_percentile_cosine = as.numeric(sim_percentile)) %>% 
  arrange(desc(sim_percentile_cosine)) %>% 
  mutate(jugador_ = jugador) %>% 
  as_data_frame()

output_z_score = data_z_score %>% 
  mutate(sim_z_score_cosine = as.numeric(sim_z_score)) %>% 
  arrange(desc(sim_z_score_cosine)) %>% 
  mutate(jugador_ = jugador) %>% 
  as_data_frame()

output = output_percentile %>% 
  select(jugador_percentile = jugador, sim_percentile_cosine) %>% 
  bind_cols(output_z_score %>% 
              select(jugador_z_score = jugador, sim_z_score_cosine))

## OBTENER MATRIZ DE SIMILITUD TODOS VS TODOS
mat_sim <- simil(
  as.matrix(data_z_score %>% select(-jugador)),
  method = "cosine"
)

mat_sim <- as.matrix(mat_sim)

rownames(mat_sim) <- data_z_score$jugador
colnames(mat_sim) <- data_z_score$jugador

sim_long <- mat_sim %>%
  as.data.frame() %>%
  tibble::rownames_to_column("Jugador_1") %>%
  pivot_longer(-Jugador_1, names_to = "Jugador_2", values_to = "Similitud") %>%
  filter(Jugador_1 != Jugador_2)

sort(view(sim_long))

write_xlsx(sim_long, "similitudes_jugadores_peru.xlsx")

#¿Qué tan diferentes son A. Valera y H. Barcos? PENDIENTE

library(ggplot2)
library(forcats)

barcos_percentile_stats = data_percentile %>% 
  filter(jugador %in% c("A. Valera", "H. Barcos")) %>%
  select(player_name, metrics_percentile) %>%
  pivot_longer(cols = -player_name) %>% 
  rename("metric" = "name", "value_p90_percentile" = "value") %>%
  mutate(metric = str_replace(metric, "_p90_percentile", "")) %>% 
  mutate(stat_group = case_when(metric %in% c("shots", "x_g_expected_goals", "goals", "chances",
                                              "dribbles", "dribbles_successful", "attacking_challenges") ~ "Ataque",
                                metric %in% c("passes", "crosses", "expected_assists", "lost_balls", "key_passes", "key_passes_accurate", "crosses_accurate") ~ "Posesión",
                                metric %in% c("ball_interceptions", "ball_recoveries_in_opponents_half",
                                              "air_challenges", "air_challenges_won", "fouls", "tackles") ~ "Defensa y Otros"),
         stat_group = factor(stat_group, levels = c("Defensa y Otros", "Posesión", "Ataque")),
         metric = str_replace_all(metric, "[_]", " "))

ggplot(kdb_mount_percentile_stats, 
       aes(x = metric, y = value_p90_percentile, fill = player_name)) +
  geom_bar(stat = "identity", position = "dodge") +
  scale_y_continuous(limits = c(0, 1), breaks = seq(0, 1, 0.1), expand = c(0.012, 0)) +
  coord_flip() +
  theme_bw() +
  geom_hline(yintercept = 0.5, size = 1) +
  geom_hline(yintercept = c(0.25, 0.75), size = 0.5, col = "grey20", linetype = 'dotted') +
  scale_fill_manual(values = c("#457b9d", "#a8dadc")) +
  #geom_label(aes(label = Per90), fill = "white", size = 2.7, hjust = 0) +
  # scale_fill_gradient2(low = "#f94144", mid = "#f9c74f", high = "#43aa8b",  
  #                      midpoint = 50, breaks = c(0, 25, 50, 75, 100), limits = c(0, 100)) +
  facet_grid(rows = vars(stat_group), scales = "free", switch = "y", space = "free_y") +
  labs(x = "", y = "", #"\nPercentil", 
       title = "\nPerfil estadístico de K. D Bruyne y M. Mount en la temporada 21-22 de Premier League", 
       subtitle = "Percentiles obtenidos al comparar valores p90 de los volantes ofensivos de la Premier League 21/22\n",
       caption = "Data: Instat\nCurso Fútbol Analytics UTEC", fill = "Percentil") +
  theme(legend.position = "bottom",
        plot.margin = margin(0.5, 1, 0.5, 0.5, "cm"),
        panel.spacing.y = unit(0, "lines"),
        title = element_text(size = 12),
        strip.background = element_rect(fill = "white"),
        strip.text = element_text(size = 10, face = "bold"))


output_longer = output %>% pivot_longer(cols = c(sim_percentile_cosine, sim_z_score_cosine)) 
ggplot(output_longer, aes(x = value, fill = name)) + geom_density(alpha = 0.5)

x = data_percentile %>% pivot_longer(-player_name)
ggplot(x, aes(x = value))+ geom_density() + facet_wrap(~name)

y = data_z_score %>% pivot_longer(-player_name)
ggplot(y, aes(x = value))+ geom_density() + facet_wrap(~name)

output_longer = output %>%
  ungroup() %>% 
  mutate(sim_z_score_cosine_scaled = (sim_z_score_cosine - min(sim_z_score_cosine))/(max(sim_z_score_cosine) - min(sim_z_score_cosine))) %>%
  select(-sim_z_score_cosine) %>% 
  pivot_longer(cols = c(sim_percentile_cosine, sim_z_score_cosine_scaled)) 
ggplot(output_longer, aes(x = value, fill = name)) + geom_density(alpha = 0.5)
