import csv, random, time
reader = csv.DictReader(open("refrigerators.updated.csv", "r"))
possible_notes = ["Nothing to report", "Faulty power supply was replaced", "null", "Seems to be in good condition"]
lines = ["date_serviced,notes,refrigerator_id,refrigerator_row_id_fake"]
for line in reader:
    while True:
        if random.randrange(10) < 2: break
        if line["year"] == "": break
        upper = 60*60*24*30*6 # six months
        if random.randrange(10) < 2: upper = 60*60*24*30*12*3 # three years
        to_format = time.localtime(time.time() - random.randrange(upper));
        year = to_format.tm_year
        csv_year = round(float(line["year"]))
        # If the year we generated for the last maintenance record was before the refrigerator was actually installed, try again
        if year < csv_year:
            continue
        year = str(year)
        month = str(to_format.tm_mon).rjust(2, "0")
        day = str(to_format.tm_mday).rjust(2, "0")
        full = year + "-" + month + "-" + day + "T00:00:00.000000000"
        lines.append(full + ","+random.choice(possible_notes)+"," + line["refrigerator_id"] + ",null")
        break
open("m_logs.csv", "w").write("\n".join(lines))
