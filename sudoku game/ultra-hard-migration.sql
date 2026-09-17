alter table public.sudoku_scores
  drop constraint if exists sudoku_scores_difficulty_check;

alter table public.sudoku_scores
  add constraint sudoku_scores_difficulty_check
  check (difficulty in ('Easy', 'Medium', 'Hard', 'Ultra Hard'));

drop policy if exists "Anyone can submit a valid Sudoku score" on public.sudoku_scores;

create policy "Anyone can submit a valid Sudoku score"
on public.sudoku_scores
for insert
to anon, authenticated
with check (
  char_length(trim(nickname)) between 1 and 20
  and score >= 0
  and solve_time >= 0
  and difficulty in ('Easy', 'Medium', 'Hard', 'Ultra Hard')
);
