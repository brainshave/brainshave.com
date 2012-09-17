define () ->
  partial: (f, args...) -> (args2...) -> f(args..., args2...)

