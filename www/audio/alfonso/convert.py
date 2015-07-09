import json, numpy
samples = numpy.array(json.load(open("03-FreakFandango-GypsySong_beats.json"))).astype(float)
samples /= 44100
json.dump(samples.tolist(), open("03-FreakFandango-GypsySong_beats_sec.json", "w"))