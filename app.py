from flask import Flask, jsonify, render_template
import random

app = Flask(__name__)

def simulate(generations=30, size=100):
    MAX_POP = 200
    population = [random.choice([True, False]) for _ in range(size)]
    history = []

    for gen in range(generations):
        survivors = []

        # survival (selection pressure)
        for fish in population:
            survival = 0.65 if fish else 0.50
            if random.random() < survival:
                survivors.append(fish)

        # reproduction + mutation
        new_pop = []
        for fish in survivors:
            for _ in range(2):
                child = fish

                # mutation
                if random.random() < 0.05:
                    child = not fish

                new_pop.append(child)

        # population cap (prevents explosion)
        if len(new_pop) > MAX_POP:
            new_pop = random.sample(new_pop, MAX_POP)

        population = new_pop

        toxic_percent = sum(population) / len(population)

        history.append({
            "generation": gen,
            "percent_toxic": toxic_percent,
            "population": len(population)
        })

    return history

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/simulate")
def run_sim():
    return jsonify(simulate())

if __name__ == "__main__":
    app.run(debug=True)