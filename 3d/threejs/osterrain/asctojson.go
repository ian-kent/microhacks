package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
	"strconv"
	"strings"
)

func main() {
	in := os.Args[1]
	//out := os.Args[2]
	out := strings.Replace(in, ".asc", ".json", -1)

	b, err := ioutil.ReadFile(in)
	if err != nil {
		panic(err)
	}

	lines := strings.Split(string(b), "\n")

	// ncols 200
	// nrows 200
	// xllcorner 300000
	// yllcorner 180000
	// cellsize 50

	var output struct {
		Points []float64 `json:"points"`
		Width  int64     `json:"width"`
		Height int64     `json:"height"`
		X      int64     `json:"x"`
		Y      int64     `json:"y"`
		Size   int64     `json:"size"`
	}

	var getInt = func(s string) (n int64) {
		n, err = strconv.ParseInt(strings.TrimSpace(s), 10, 64)
		if err != nil {
			panic(err)
		}
		return
	}

	for i := 0; i < 5; i++ {
		parts := strings.Split(lines[i], " ")
		switch parts[0] {
		case "ncols":
			output.Width = getInt(parts[1])
		case "nrows":
			output.Height = getInt(parts[1])
		case "xllcorner":
			output.X = getInt(parts[1])
		case "yllcorner":
			output.Y = getInt(parts[1])
		case "cellsize":
			output.Size = getInt(parts[1])
		}
	}

	for i := 5; i < 205; i++ {
		pos := strings.Split(lines[i], " ")

		for j := 0; j < len(pos); j++ {
			f, err := strconv.ParseFloat(strings.TrimSpace(pos[j]), 64)
			if err != nil {
				panic(err)
			}
			output.Points = append(output.Points, f)
		}
	}

	b, err = json.Marshal(output)
	if err != nil {
		panic(err)
	}

	ioutil.WriteFile(out, b, 0644)

	log.Println(in)
	log.Println(out)
}
