library("tidyverse")
library("readr")

PD <- read_csv("target_files/race_type.csv")

set.seed(20)
Cluster <- kmeans(PD[,3],3,nstart=25)
Cluster

PD$x <- paste(PD$subject_race,PD$type_of_resistance)

table1 <- table(Cluster$cluster, PD$x)


write.table(table1, file = "table1.csv", sep = ",", quote = FALSE, row.names = F)