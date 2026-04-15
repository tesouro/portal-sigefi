library(tidyverse, readxl, jsonlite)
data <- readxl::read_excel("pagamentos-2025.xlsx", skip = 8)

data2 <- data %>%
  mutate(bil = round(`PAGAMENTOS TOTAIS (EXERCICIO + RP)`/1e9, 1)) %>%
  filter(bil >= 0.1) %>%
  mutate(squares = ifelse(bil < 1, ceiling(bil), round(bil)))

jsonlite::write_json(data2, "data.json")
