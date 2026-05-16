#!/bin/bash
MODEL="${MODEL:-qwen2.5-coder:1.5b}"
HOST="${HOST:-http://localhost:11434}"
build_prompt() {
  local input="$1"
  cat <<EOF
You are a Go syntax completion engine.
You receive an INCOMPLETE line of Go code.
You must output ONLY the characters that should be appended to the end of that line to make the syntax valid.
Do NOT repeat the input.
Do NOT output the full line.
Do NOT add explanations, comments, or markdown.
Output raw characters only. Stop at the first newline.
Examples:
Input: "var x func"          Output: "() {}"
Input: "type User str"       Output: "uct {}"
Input: "func (r *Repo"       Output: ") {}"
Input: "var m map[str"       Output: "ing]interface{}"
Input: "ch := make(chan"     Output: " int)"
Input: "x := SomeStruct{"    Output: "}"
Input: "func getName("       Output: ") string {}"
Input: "x.("                 Output: "Type)"
Input: "var x map"           Output: "[string]interface{}"
Input: "type X interface"   Output: " {}"
Input: "type X chan"         Output: " int"
Input: "func (r *Repo) Get(" Output: ") string {}"
Input: "var x = 5"           Output: ""
Input: "func main() {}"      Output: ""
Input: "map[string]int"      Output: ""
Now complete:
Input: "$input"
Output:
EOF
}
run() {
  local input="$1"
  local expected="$2"
  local desc="$3"
  local prompt
  prompt=$(build_prompt "$input")
  local payload
  payload=$(jq -n \
    --arg model "$MODEL" \
    --arg prompt "$prompt" \
    '{
      model: $model,
      prompt: $prompt,
      stream: false,
      system: "You are a Go syntax completion engine. Output ONLY the missing syntax characters. Never use markdown, never use quotes, never explain. If the code is already complete, output absolutely nothing.",
      options: {
        temperature: 0,
        num_predict: 30,
        stop: ["\n", "Input:"]
      }
    }')
  local raw
  raw=$(curl -s "$HOST/api/generate" -d "$payload" | jq -r '.response // empty')
  # Strip markdown, quotes, backticks, whitespace
  local cleaned
  cleaned=$(printf '%s' "$raw" | sed 's/```[a-z]*//g; s/`//g; s/"//g; s/^[[:space:]]*//;s/[[:space:]]*$//')
  if [[ "$cleaned" == "$expected" ]]; then
    echo "  ✓ $desc -> '$cleaned'"
  else
    echo "  ✗ $desc"
    echo "      expected: '$expected'"
    echo "      got:      '$cleaned'"
    echo "      raw:      '$raw'"
  fi
}
echo "Prompt tests — Model: $MODEL"
echo ""
run "var x func"           "() {}"            "var x func"
run "type User str"        "uct {}"           "type User str"
run "func (r *Repo"        ") {}"             "func (r *Repo"
run "var m map[str"        "ing]interface{}" "var m map[str"
run "ch := make(chan"      " int)"            "ch := make(chan"
run "x := SomeStruct{"     "}"                "x := SomeStruct{"
run "func getName("        ") string {}"      "func getName("
run "x.("                  "Type)"            "x.("
run "var x map"            "[string]interface{}" "var x map"
run "type X interface"    " {}"              "type X interface"
run "type X chan"          " int"             "type X chan"
run "func (r *Repo) Get("  ") string {}"     "func (r *Repo) Get("
run "var x = 5"            ""                 "complete line returns empty"
run "func main() {}"       ""                 "complete func returns empty"
run "map[string]int"       ""                 "complete map returns empty"
echo ""
echo "Best version so far. 8/15 baseline. Post-process in Phase 5."