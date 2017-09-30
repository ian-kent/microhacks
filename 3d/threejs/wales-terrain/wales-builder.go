package main

import (
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"io/ioutil"
	"log"
	"math"
	"os"
	"strconv"
	"strings"
)

var walesGrid = []string{
	"", "SH", "SJ",
	"SM", "SN", "SO",
	"SR", "SS", "ST",
}

var walesData [][]float64

type gridFile struct {
	Points []float64 `json:"points"`
	Width  int64     `json:"width"`
	Height int64     `json:"height"`
	X      int64     `json:"x"`
	Y      int64     `json:"y"`
	Size   int64     `json:"size"`
}

func main() {
	dataPath := os.Getenv("DATA_PATH")
	div := 10

	outImg := image.NewRGBA(image.Rect(0, 0, (6000 / div), (6000 / div)))
	for x := 0; x < 6000/div; x++ {
		for y := 0; y < 6000/div; y++ {
			outImg.SetRGBA(x, y, color.RGBA{0, 0, 0, 255})
		}
	}

	outTexture := image.NewRGBA(image.Rect(0, 0, (6000 / div), (6000 / div)))
	for x := 0; x < 6000/div; x++ {
		for y := 0; y < 6000/div; y++ {
			outTexture.SetRGBA(x, y, color.RGBA{0, 0, 255, 255})
		}
	}

	refSize := 10
	gridSize := 200
	gridPoints := gridSize * gridSize
	refPoints := (refSize * refSize) * gridPoints
	totalPoints := refPoints * len(walesGrid)

	// log.Println(totalPoints)
	edge := int(math.Sqrt(float64(totalPoints))) / div
	walesData = make([][]float64, edge, edge)
	for i := 0; i < edge; i++ {
		walesData[i] = make([]float64, edge, edge)
	}

	// Loop through walesGrid (each cell is 2000 wide)
	for row := 0; row < 3; row++ {
		for col := 0; col < 3; col++ {
			// log.Println(row*3 + col)
			gridRef := walesGrid[row*3+col]
			if len(gridRef) == 0 {
				continue
			}

			// Loop through 10x10 tiles in grid location (each tile is 200 wide)
			for y := 9; y >= 0; y-- {
				for x := 0; x < 10; x++ {
					data, err := ioutil.ReadFile(dataPath + "/" + gridRef + fmt.Sprintf("%d%d", x, y) + ".asc")
					if err != nil {
						continue
					}

					// Convert grid file to struct
					gridFile := ascToStruct(data)

					// Calculate absolute X/Y position in world space
					gridX := (col * (2000 / div)) + (x * (200 / div))
					gridY := (row * (2000 / div)) + ((9 - y) * (200 / div))

					log.Printf("%s => { X: %d, Y: %d }", gridRef+fmt.Sprintf("%d%d", x, y), gridX, gridY)

					for localY := 0; localY < (200 / div); localY++ {
						for localX := 0; localX < (200 / div); localX++ {
							tileX := localX * div
							tileY := localY * div

							num := float64(0)

							for k := tileY; k < tileY+div; k++ {
								for l := tileX; l < tileX+div; l++ {
									num += gridFile.Points[k*200+l]
								}
							}

							num = num / float64(div*div)

							// point := gridFile.Points[j*200+i]
							walesData[gridY+localY][gridX+localX] = num

							outImg.Set(gridX+localX, gridY+localY, color.RGBA{uint8(num / 5), uint8(num / 5), uint8(num / 5), 255})
							var c color.RGBA
							if num > 600 {
								c = color.RGBA{255, 255, 255, 255}
							} else if num <= 0 {
								c = color.RGBA{0, 0, 255, 255}
							} else {
								c = color.RGBA{0, 255, 0, 255}
							}
							outTexture.Set(gridX+localX, gridY+localY, c)
						}
					}
				}
			}
		}
	}

	// log.Println(walesData)
	outputData := make([]float64, 0)
	for y := range walesData {
		outputData = append(outputData, walesData[y]...)
	}
	b, err := json.Marshal(outputData)
	if err != nil {
		panic(err)
	}
	err = ioutil.WriteFile("out.json", b, 0644)
	if err != nil {
		panic(err)
	}

	// Draw grid lines
	interval := 6000 / div / 3
	for x := interval; x < 6000/div; x += interval {
		for y := 0; y < 6000/div; y++ {
			outImg.Set(x, y, color.RGBA{255, 0, 0, 255})
		}
	}
	for x := 0; x < 6000/div; x++ {
		for y := interval; y < 6000/div; y += interval {
			outImg.Set(x, y, color.RGBA{255, 0, 0, 255})
		}
	}

	f, err := os.Create("out.png")
	if err != nil {
		panic(err)
	}
	defer f.Close()
	png.Encode(f, outImg)

	f, err = os.Create("texture.png")
	if err != nil {
		panic(err)
	}
	defer f.Close()
	png.Encode(f, outTexture)
}

func ascToStruct(b []byte) gridFile {
	lines := strings.Split(string(b), "\n")

	// ncols 200
	// nrows 200
	// xllcorner 300000
	// yllcorner 180000
	// cellsize 50

	var output gridFile

	var getInt = func(s string) (n int64) {
		n, err := strconv.ParseInt(strings.TrimSpace(s), 10, 64)
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

	return output
}
